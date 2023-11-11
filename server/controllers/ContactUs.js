const { contactUsEmail } = require("../mail/templates/contactFormRes");
const mailSender = require("../utils/mailSender");

exports.contactUsController = async (req, res) => {
  // Extracting data from the request body
  const { email, firstname, lastname, message, phoneNo, countrycode } = req.body;
  console.log(req.body);

  try {
    // Sending a confirmation email to the user
    const emailRes = await mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
    );

    console.log("Email Response: ", emailRes);

    // Sending a success response to the client
    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    // Handling errors and sending an error response
    console.log("Error: ", error);
    console.log("Error message: ", error.message);

    return res.json({
      success: false,
      message: "Something went wrong...",
    });
  }
};
