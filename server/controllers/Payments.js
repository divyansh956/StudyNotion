const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  // Validate if courses array is provided
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }

  let totalAmount = 0;

  try {
    // Calculate the total amount for all courses
    for (const courseId of courses) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(200).json({ success: false, message: "Could not find the Course" });
      }
      totalAmount += course.price;
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };

    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Could not initiate order." });
  }
};

// Verify the payment
exports.verifyPayment = async (req, res) => {
  // const razorpayOrderId = req.body?.razorpay_order_id;
  // const razorpayPaymentId = req.body?.razorpay_payment_id;
  // const razorpaySignature = req.body?.razorpay_signature;
  try {
    const { courses, userId } = req.body;
    console.log("Courses: ", courses);

    // if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !courses || !userId) {
    //   return res.status(200).json({ success: false, message: "Payment Failed" });
    // }

    // let body = razorpayOrderId + "|" + razorpayPaymentId;

    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_SECRET)
    //   .update(body.toString())
    //   .digest("hex");

    // if (expectedSignature === razorpaySignature) {
    //   await enrollStudents(courses, userId, res);
    //   return res.status(200).json({ success: true, message: "Payment Verified" });
    // }

    // await enrollStudents(courses, userId, res);
    return res.status(200).json({ success: true, message: "Payment Verified" });
  }
  catch (error) {
    console.log(error);
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }
};

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({ success: false, message: "Please provide all the details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("Error in sending mail", error);
    return res.status(400).json({ success: false, message: "Could not send email" });
  }
};

// Enroll the student in the courses
exports.enrollStudents = async (req, res) => {
  const { courses, userId } = req.body;
  if (!courses || !userId) {
    return res.status(400).json({ success: false, message: "Please Provide Course ID and User ID" });
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({ success: false, error: "Course not found" });
      }
      console.log("Updated course: ", enrolledCourse);

      // Create a new course progress record
      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      console.log("Enrolled student: ", enrolledStudent);

      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log("Email sent successfully: ");
      return res.status(200).json({ success: true, message: "Payment Verified" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
};