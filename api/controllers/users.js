const User = require("../models/user");
const { Resend } = require("resend");
const { EmailUser } = require("../emails/email-user.js");
const { render } = require("@react-email/render");
const bcrypt = require('bcryptjs');

async function create(req, res) {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ firstname, lastname, email, password: hashedPassword });

    const savedUser = await user.save();
    console.log("User created, id:", savedUser._id.toString());
    return res.status(201).json({ message: "OK" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Something went wrong" });
  }
}

async function editUser(req, res) {
  const userId = req.user_id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const bio = req.body.bio;
  const jobtitle = req.body.jobtitle;
  const opentowork = req.body.opentowork;
  const location = req.body.location;
  const links = req.body.links;
  const github = req.body.github;

  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        firstname: firstname,
        lastname: lastname,
        bio: bio,
        jobtitle: jobtitle,
        opentowork: opentowork,
        location: location,
        links: links,
        github: github,
      },
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    user: user,
  });
}

async function getUserById(req, res) {
  const userId = req.user_id;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = await User.findById(userId).select("-password");
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    user: user,
  });
}

async function getUserByEmail(req, res) {
  const email = req.query.email;

  const user = await User.findOne({ email: email }, "_id firstname lastname");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const safeUser = user.toObject();
  delete safeUser.password;

  res.status(200).json({ user: safeUser });
}

async function getUserBySlug(req, res) {
  const user = req.user;
  res.status(200).json({ user: user });
}

async function getUserByName(req, res) {
  const name = req.query.name;

  const users = await User.find({
    $and: [
      {
        $or: [
          { firstname: { $regex: name, $options: "i" } },
          { lastname: { $regex: name, $options: "i" } },
        ],
      },
      { visibility: true },
    ],
  }).select("-password");

  if (users.length === 0) {
    return res.status(404).json({ message: "No user found with this name" });
  }

  res.status(200).json({ users: users });
}

async function toggleVisibility(req, res) {
  const userId = req.user_id;
  const visibility = req.body.visibility;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { visibility: visibility } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: user, message: "Visibility updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating visibility" });
  }
}

async function getUserBadge(req, res) {
  const user = req.user;
  try {
    const totalViews = user.analytics.views.length;
    const totalEmails = user.analytics.emails.length;
    const badges = [];

    if (totalViews >= 50) badges.push("50_views");
    if (totalViews >= 100) badges.push("100_views");
    if (totalEmails >= 10) badges.push("10_emails");
    if (user.projects.length >= 5) badges.push("5_projects");
    if (user.cv) badges.push("cv_uploaded");

    res.status(200).json({ badges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

async function sendEmail(req, res) {
  try {
    const user = req.user;
    const { name, subject, message } = req.body;

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailData = {
      name,
      subject,
      message,
    };

    const emailHtml = render(EmailUser({ user, email: emailData }));
    const data = await emailHtml;

    await resend.emails.send({
      from: "noreply@yanait.com",
      to: user.email,
      subject: emailData.subject,
      html: data,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to send email" });
  }
}

const UsersController = {
  create,
  editUser,
  getUserById,
  getUserBySlug,
  getUserByEmail,
  getUserByName,
  toggleVisibility,
  getUserBadge,
  sendEmail,
};

module.exports = UsersController;
