const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    // Destructure request body and user ID
    const { firstName = "", lastName = "", dateOfBirth = "", about = "", contactNumber = "", gender = "" } = req.body;
    const id = req.user.id;

    // Find the user by ID and update first name and last name only if provided
    const userUpdate = {};
    if (firstName) userUpdate.firstName = firstName;
    if (lastName) userUpdate.lastName = lastName;
    const user = await User.findByIdAndUpdate(id, userUpdate);

    // Check if the user is not found
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find the user's profile by ID
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details with populated profile
    const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec();

    // Respond with success and updated user details
    return res.json({ success: true, message: "Profile updated successfully", updatedUserDetails });
  } catch (error) {
    // Handle errors and respond with an error message
    console.log(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Method for deleting a user account
exports.deleteAccount = async (req, res) => {
  try {
    console.log("Printing ID: ", req.user.id);
    const id = req.user.id;

    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete Associated Profile with the User
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });

    // TODO: Unenroll User From All the Enrolled Courses

    // Now Delete User
    await User.findByIdAndDelete({ _id: id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "User cannot be deleted successfully" });
  }
};

// Method for fetching all details of a user
exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    console.log(userDetails);
    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Method for updating the display picture of a user
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: "Image updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Method for fetching enrolled courses of a user
exports.getEnrolledCourses = async (req, res) => {
  try {
    // Get the user ID from the request object
    const userId = req.user.id;

    // Find the user details by user ID and populate the courses and their content
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    // Convert the user details to a JavaScript object
    userDetails = userDetails.toObject();

    // Initialize the subsection length
    var SubsectionLength = 0;

    // Loop through each course
    for (var i = 0; i < userDetails.courses.length; i++) {
      // Initialize the total duration in seconds
      let totalDurationInSeconds = 0;

      // Reset the subsection length for each course
      SubsectionLength = 0;

      // Loop through each course content
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        // Calculate the total duration in seconds by adding up the time duration of each subsection
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0);

        // Convert the total duration in seconds to a duration format and assign it to the course
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        );

        // Calculate the total number of subsections
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length;
      }

      // Find the course progress count by course ID and user ID
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      });

      // Get the length of the completed videos
      courseProgressCount = courseProgressCount?.completedVideos.length;

      // If there are no subsections, set the progress percentage to 100
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100;
      } else {
        // Calculate the progress percentage up to 2 decimal points
        const multiplier = Math.pow(10, 2);
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier;
      }
    }

    // If the user details do not exist, return a 400 error
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userId}`,
      });
    }

    // Return a successful response with the courses
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    // Return a 500 error response
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Method for fetching instructor dashboard data
exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id });

    const courseData = courseDetails.map((course) => {
      // Calculate total students enrolled and total amount generated for each course
      const totalStudentsEnrolled = course.studentsEnrolled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      };
      return courseDataWithStats;
    });

    res.status(200).json({ courses: courseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};