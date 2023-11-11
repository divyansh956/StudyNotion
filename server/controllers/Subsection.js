// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { sectionId, title, description } = req.body;
    const video = req.files.video;

    // Check if all necessary fields are provided
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({ success: false, message: "All Fields are Required" });
    }

    // Upload the video file to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

    // Create a new sub-section with the necessary information
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    // Return the updated section in the response
    return res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a sub-section
exports.updateSubSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { subSectionId, title, description } = req.body;
    const video = req.files.video;

    // Check if subSectionId is provided
    if (!subSectionId) {
      return res.status(400).json({ success: false, message: "subSectionId is required" });
    }

    // Prepare an update object with only the provided fields
    const updateObject = {};
    if (title) updateObject.title = title;
    if (description) updateObject.description = description;

    // If a new video is provided, upload it to Cloudinary and update the fields
    if (video) {
      const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
      updateObject.timeDuration = `${uploadDetails.duration}`;
      updateObject.videoUrl = uploadDetails.secure_url;
    }

    // Update the sub-section with the necessary information
    const updatedSubSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      updateObject,
      { new: true }
    );

    // Return the updated sub-section in the response
    return res.status(200).json({ success: true, data: updatedSubSection });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error updating sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a sub-section
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;

    // Remove sub-section from the corresponding section
    await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );

    // Delete the sub-section
    const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

    if (!deletedSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // Find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate("subSection");

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};