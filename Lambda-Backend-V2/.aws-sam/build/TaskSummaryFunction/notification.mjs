import { MongoClient } from "mongodb";
import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";
import { DateTime } from 'luxon';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

const client = new MongoClient(process.env.MONGODB_URI);
let db;

const LOGO_URL = "https://assets.unlayer.com/projects/274958/1749390508668-966247.png";
const APP_NAME = "TinuMind";

let emailTemplateHtml = null;

// Function to capitalize the first letter of each word in a string
function toTitleCase(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

export async function handler(event) {
  console.log("Lambda function started");

  try {
    if (!db) {
      console.log("Connecting to MongoDB...");
      await client.connect();
      db = client.db(process.env.DB_NAME || "TinumindDB");
      console.log("Connected to MongoDB");
    }

    const tasksCollection = db.collection("Tasks");
    console.log("Accessing Tasks collection");

    console.log("Fetching distinct users...");
    const users = await tasksCollection
      .aggregate([
        {
          $match: {
            email: { $exists: true, $ne: null },
            name: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: "$userId",
            email: { $first: "$email" },
            name: { $first: "$name" },
            // timezone: { $first: "$timezone" } // Uncomment if you store timezone per user
          },
        },
      ])
      .toArray();

    console.log(`Found ${users.length} users`);

    if (!emailTemplateHtml) {
        const templatePath = path.join(__dirname, 'email.html');
        emailTemplateHtml = await fs.readFile(templatePath, 'utf8');
        console.log("Email template loaded from file.");
    }

    for (const user of users) {
      if (!user.email || !user.name) {
          console.warn(`Skipping user with _id: ${user._id} due to missing email or name after aggregation.`);
          continue;
      }
      console.log(`Processing user: ${user.name} (${user.email})`);

      const userTimezone = user.timezone || 'Africa/Lagos';

      const nowInUserTimezone = DateTime.now().setZone(userTimezone);
      console.log(`Current time in user's timezone (${userTimezone}): ${nowInUserTimezone.toISO()}`);

      const startOfTodayUTC = nowInUserTimezone.startOf('day').toJSDate();
      const endOfTodayUTC = nowInUserTimezone.endOf('day').toJSDate();

      const startOfWeekUTC = nowInUserTimezone.startOf('week').toJSDate();
      const endOfWeekUTC = nowInUserTimezone.endOf('week').toJSDate();

      const startOfMonthUTC = nowInUserTimezone.startOf('month').toJSDate();
      const endOfMonthUTC = nowInUserTimezone.endOf('month').toJSDate();

      console.log(`Query Ranges for ${user.name}:`);
      console.log(`  Today: ${startOfTodayUTC.toISOString()} to ${endOfTodayUTC.toISOString()}`);
      console.log(`  Week: ${startOfWeekUTC.toISOString()} to ${endOfWeekUTC.toISOString()}`);
      console.log(`  Month: ${startOfMonthUTC.toISOString()} to ${endOfMonthUTC.toISOString()}`);

      const [todayCount, weekCount, monthCount] = await Promise.all([
        tasksCollection.countDocuments({
          userId: user._id,
          dueDate: { $gte: startOfTodayUTC, $lte: endOfTodayUTC },
          status: { $ne: "Completed" }
        }),
        tasksCollection.countDocuments({
          userId: user._id,
          dueDate: { $gte: startOfWeekUTC, $lte: endOfWeekUTC },
          status: { $ne: "Completed" }
        }),
        tasksCollection.countDocuments({
          userId: user._id,
          dueDate: { $gte: startOfMonthUTC, $lte: endOfMonthUTC },
          status: { $ne: "Completed" }
        }),
      ]);

      console.log(
        `Counts for ${user.email} - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}`
      );

      if (user.email) {
        console.log(`Attempting to send email to ${user.email}...`);

        const currentYear = new Date().getFullYear();

        let personalizedHtml = emailTemplateHtml
            .replace("{{LOGO_URL}}", LOGO_URL)
            .replace("{{USER_NAME}}", toTitleCase(user.name || "there")) // Applying title case here
            .replace("{{TODAY_COUNT}}", todayCount)
            .replace("{{WEEK_COUNT}}", weekCount)
            .replace("{{MONTH_COUNT}}", monthCount)
            .replace(/{{APP_NAME}}/g, APP_NAME)
            .replace("{{CURRENT_YEAR}}", currentYear);

        try {
          const result = await resend.emails.send({
            from: "TinuMind <noreply@tinumind.baymufy.com>",
            to: [user.email],
            subject: "📋 Your TinuMind Task Summary",
            html: personalizedHtml,
            text: `Hi ${toTitleCase(user.name || "there")},\n\nHere's your task summary:\n\n🗓️ Today: ${todayCount}\n📅 This Week: ${weekCount}\n🗂️ This Month: ${monthCount}\n\nKeep up the great work!\n\n- The TinuMind Team`,
          });
          console.log(`Email sent successfully to ${user.email}:`, result.id);
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      }
    }

    console.log("All email attempts completed.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Task summaries sending process completed." }),
    };
  } catch (err) {
    console.error("Error occurred in Lambda:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
}















// import { MongoClient } from "mongodb";
// import { Resend } from "resend";
// import fs from "fs/promises";
// import path from "path";
// import { DateTime } from 'luxon'; // Import Luxon

// import { fileURLToPath } from 'url'; // Corrected import
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const resend = new Resend(process.env.RESEND_API_KEY);

// const client = new MongoClient(process.env.MONGODB_URI);
// let db;

// const LOGO_URL = "https://assets.unlayer.com/projects/274958/1749390508668-966247.png";
// const APP_NAME = "TinuMind";

// let emailTemplateHtml = null;

// export async function handler(event) {
//   console.log("Lambda function started");

//   try {
//     // Connect to MongoDB only if not already connected (reuses connection for warm starts)
//     if (!db) {
//       console.log("Connecting to MongoDB...");
//       await client.connect();
//       db = client.db(process.env.DB_NAME || "TinumindDB"); // Use DB_NAME from env or default
//       console.log("Connected to MongoDB");
//     }

//     const tasksCollection = db.collection("Tasks");
//     console.log("Accessing Tasks collection");

//     // Aggregate distinct users who have both an email and a name defined
//     console.log("Fetching distinct users...");
//     const users = await tasksCollection
//       .aggregate([
//         {
//           $match: { // Filter out documents where email or name is missing/null
//             email: { $exists: true, $ne: null },
//             name: { $exists: true, $ne: null }
//           }
//         },
//         {
//           $group: { // Group by userId to get unique users
//             _id: "$userId",
//             email: { $first: "$email" }, // Get the first email associated with this userId
//             name: { $first: "$name" },   // Get the first name associated with this userId
//             // IMPORTANT: If you store timezone per user, retrieve it here:
//             // timezone: { $first: "$timezone" }
//           },
//         },
//       ])
//       .toArray();

//     console.log(`Found ${users.length} users`);

//     // Read the HTML email template file once per Lambda warm start
//     if (!emailTemplateHtml) {
//         // Construct the full path to email.html using __dirname
//         const templatePath = path.join(__dirname, 'email.html');
//         emailTemplateHtml = await fs.readFile(templatePath, 'utf8');
//         console.log("Email template loaded from file.");
//     }

//     // Loop through each found user to process tasks and send emails
//     for (const user of users) {
//       // Double-check if email or name are still missing (should be prevented by $match)
//       if (!user.email || !user.name) {
//           console.warn(`Skipping user with _id: ${user._id} due to missing email or name after aggregation.`);
//           continue;
//       }
//       console.log(`Processing user: ${user.name} (${user.email})`);

//       // Determine the user's timezone for accurate date calculations.
//       // If you can't store it per user, 'Africa/Lagos' is used as a default.
//       const userTimezone = user.timezone || 'Africa/Lagos';

//       // Use Luxon to get the current date/time in the user's specific timezone
//       const nowInUserTimezone = DateTime.now().setZone(userTimezone);
//       console.log(`Current time in user's timezone (${userTimezone}): ${nowInUserTimezone.toISO()}`);

//       // Calculate the start and end of "today", "this week", and "this month"
//       // in the user's timezone, then convert to UTC for MongoDB queries.
//       const startOfTodayUTC = nowInUserTimezone.startOf('day').toJSDate();
//       const endOfTodayUTC = nowInUserTimezone.endOf('day').toJSDate();

//       const startOfWeekUTC = nowInUserTimezone.startOf('week').toJSDate(); // Luxon's week starts on Monday by default
//       const endOfWeekUTC = nowInUserTimezone.endOf('week').toJSDate();

//       const startOfMonthUTC = nowInUserTimezone.startOf('month').toJSDate();
//       const endOfMonthUTC = nowInUserTimezone.endOf('month').toJSDate();

//       console.log(`Query Ranges for ${user.name}:`);
//       console.log(`  Today: ${startOfTodayUTC.toISOString()} to ${endOfTodayUTC.toISOString()}`);
//       console.log(`  Week: ${startOfWeekUTC.toISOString()} to ${endOfWeekUTC.toISOString()}`);
//       console.log(`  Month: ${startOfMonthUTC.toISOString()} to ${endOfMonthUTC.toISOString()}`);

//       // Get counts of tasks due today, this week, and this month for the current user,
//       // EXCLUDING tasks with a status of "Completed".
//       const [todayCount, weekCount, monthCount] = await Promise.all([
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: { $gte: startOfTodayUTC, $lte: endOfTodayUTC },
//           status: { $ne: "Completed" } // Exclude completed tasks
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: { $gte: startOfWeekUTC, $lte: endOfWeekUTC },
//           status: { $ne: "Completed" } // Exclude completed tasks
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: { $gte: startOfMonthUTC, $lte: endOfMonthUTC },
//           status: { $ne: "Completed" } // Exclude completed tasks
//         }),
//       ]);

//       console.log(
//         `Counts for ${user.email} - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}`
//       );

//       // Attempt to send email if user has an email address
//       if (user.email) {
//         console.log(`Attempting to send email to ${user.email}...`);

//         // Get the current year for the copyright notice
//         const currentYear = new Date().getFullYear();

//         // Populate the HTML template with dynamic data using string replacement
//         let personalizedHtml = emailTemplateHtml
//             .replace("{{LOGO_URL}}", LOGO_URL)
//             .replace("{{USER_NAME}}", user.name || "there") // Fallback to "there" if name is unexpectedly missing
//             .replace("{{TODAY_COUNT}}", todayCount)
//             .replace("{{WEEK_COUNT}}", weekCount)
//             .replace("{{MONTH_COUNT}}", monthCount)
//             .replace(/{{APP_NAME}}/g, APP_NAME) // Use global regex for multiple replacements
//             .replace("{{CURRENT_YEAR}}", currentYear);

//         try {
//           // Send the email using Resend
//           const result = await resend.emails.send({
//             from: "TinuMind <noreply@tinumind.baymufy.com>", // Your verified sending domain
//             to: [user.email], // Recipient email address
//             subject: "📋 Your TinuMind Task Summary", // Email subject
//             html: personalizedHtml, // The beautifully designed HTML content
//             // Provide a plain text fallback for email clients that don't render HTML well
//             text: `Hi ${user.name || "there"},\n\nHere's your task summary:\n\n🗓️ Today: ${todayCount}\n📅 This Week: ${weekCount}\n🗂️ This Month: ${monthCount}\n\nKeep up the great work!\n\n- The TinuMind Team`,
//           });
//           console.log(`Email sent successfully to ${user.email}:`, result.id);
//         } catch (emailError) {
//           console.error(`Failed to send email to ${user.email}:`, emailError);
//         }
//       }
//     }

//     console.log("All email attempts completed.");
//     // Return a successful response
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Task summaries sending process completed." }),
//     };
//   } catch (err) {
//     // Log and return an error response for any unhandled exceptions
//     console.error("Error occurred in Lambda:", err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message || "Internal server error" }),
//     };
//   }
// }
















// import { MongoClient } from "mongodb";
// import { Resend } from "resend";
// import fs from "fs/promises";
// import path from "path";
// import { DateTime } from 'luxon'; // Import Luxon

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const resend = new Resend(process.env.RESEND_API_KEY);

// const client = new MongoClient(process.env.MONGODB_URI);
// let db;

// const LOGO_URL = "https://assets.unlayer.com/projects/274958/1749390508668-966247.png";
// const APP_NAME = "TinuMind";

// let emailTemplateHtml = null;

// export async function handler(event) {
//   console.log("Lambda function started");

//   try {
//     if (!db) {
//       console.log("Connecting to MongoDB...");
//       await client.connect();
//       db = client.db(process.env.DB_NAME || "TinumindDB");
//       console.log("Connected to MongoDB");
//     }

//     const tasksCollection = db.collection("Tasks");
//     console.log("Accessing Tasks collection");

//     console.log("Fetching distinct users...");
//     const users = await tasksCollection
//       .aggregate([
//         {
//           $match: {
//             email: { $exists: true, $ne: null },
//             name: { $exists: true, $ne: null }
//           }
//         },
//         {
//           $group: {
//             _id: "$userId",
//             email: { $first: "$email" },
//             name: { $first: "$name" },
//             // If you can store timezone per user, retrieve it here:
//             // timezone: { $first: "$timezone" }
//           },
//         },
//       ])
//       .toArray();

//     console.log(`Found ${users.length} users`);

//     // Read the HTML email template file once per Lambda warm start
//     if (!emailTemplateHtml) {
//         const templatePath = path.join(__dirname, 'email.html');
//         emailTemplateHtml = await fs.readFile(templatePath, 'utf8');
//         console.log("Email template loaded from file.");
//     }

//     for (const user of users) {
//       if (!user.email || !user.name) {
//           console.warn(`Skipping user with _id: ${user._id} due to missing email or name after aggregation.`);
//           continue;
//       }
//       console.log(`Processing user: ${user.name} (${user.email})`);

//       // --- REVISED DATE RANGE CALCULATIONS USING LUXON ---
//       // IMPORTANT: If you cannot pass the user's specific timezone from the frontend
//       // (e.g., 'Africa/Lagos' for Ibadan), then you might have to
//       // default to a common timezone or use a best guess.
//       // For this example, let's assume 'Africa/Lagos' which is UTC+1.
//       // Ideally, store `user.timezone` when the user registers or updates their profile.
//       const userTimezone = user.timezone || 'Africa/Lagos'; // Fallback or retrieve from user object

//       const nowInUserTimezone = DateTime.now().setZone(userTimezone);
//       console.log(`Current time in user's timezone (${userTimezone}): ${nowInUserTimezone.toISO()}`);


//       // Start of Today in User's Timezone, converted to UTC
//       const startOfTodayUTC = nowInUserTimezone.startOf('day').toJSDate();
//       // End of Today in User's Timezone, converted to UTC
//       const endOfTodayUTC = nowInUserTimezone.endOf('day').toJSDate();

//       // Start of Week in User's Timezone, converted to UTC (week starts on Monday for date-fns in your example)
//       // Luxon's `startOf('week')` defaults to Monday
//       const startOfWeekUTC = nowInUserTimezone.startOf('week').toJSDate();
//       // End of Week in User's Timezone, converted to UTC
//       const endOfWeekUTC = nowInUserTimezone.endOf('week').toJSDate();

//       // Start of Month in User's Timezone, converted to UTC
//       const startOfMonthUTC = nowInUserTimezone.startOf('month').toJSDate();
//       // End of Month in User's Timezone, converted to UTC
//       const endOfMonthUTC = nowInUserTimezone.endOf('month').toJSDate();

//       console.log(`Query Ranges for ${user.name}:`);
//       console.log(`  Today: ${startOfTodayUTC.toISOString()} to ${endOfTodayUTC.toISOString()}`);
//       console.log(`  Week: ${startOfWeekUTC.toISOString()} to ${endOfWeekUTC.toISOString()}`);
//       console.log(`  Month: ${startOfMonthUTC.toISOString()} to ${endOfMonthUTC.toISOString()}`);
//       // --- END REVISED DATE RANGE CALCULATIONS ---

//       // Get counts of tasks due today, this week, and this month for the current user
//       const [todayCount, weekCount, monthCount] = await Promise.all([
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: { $gte: startOfTodayUTC, $lte: endOfTodayUTC }, // Use $lte for endOf day
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: { $gte: startOfWeekUTC, $lte: endOfWeekUTC }, // Use $lte for endOf week
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: { $gte: startOfMonthUTC, $lte: endOfMonthUTC }, // Use $lte for endOf month
//         }),
//       ]);

//       console.log(
//         `Counts for ${user.email} - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}`
//       );

//       if (user.email) {
//         console.log(`Attempting to send email to ${user.email}...`);

//         const currentYear = new Date().getFullYear();

//         let personalizedHtml = emailTemplateHtml
//             .replace("{{LOGO_URL}}", LOGO_URL)
//             .replace("{{USER_NAME}}", user.name || "there")
//             .replace("{{TODAY_COUNT}}", todayCount)
//             .replace("{{WEEK_COUNT}}", weekCount)
//             .replace("{{MONTH_COUNT}}", monthCount)
//             .replace(/{{APP_NAME}}/g, APP_NAME)
//             .replace("{{CURRENT_YEAR}}", currentYear);

//         try {
//           const result = await resend.emails.send({
//             from: "TinuMind <noreply@tinumind.baymufy.com>",
//             to: [user.email],
//             subject: "📋 Your TinuMind Task Summary",
//             html: personalizedHtml,
//             text: `Hi ${user.name || "there"},\n\nHere's your task summary:\n\n🗓️ Today: ${todayCount}\n📅 This Week: ${weekCount}\n🗂️ This Month: ${monthCount}\n\nKeep up the great work!\n\n- The TinuMind Team`,
//           });
//           console.log(`Email sent successfully to ${user.email}:`, result.id);
//         } catch (emailError) {
//           console.error(`Failed to send email to ${user.email}:`, emailError);
//         }
//       }
//     }

//     console.log("All email attempts completed.");
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Task summaries sending process completed." }),
//     };
//   } catch (err) {
//     console.error("Error occurred in Lambda:", err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message || "Internal server error" }),
//     };
//   }
// }










// import { MongoClient } from "mongodb";
// import { Resend } from "resend";
// import fs from "fs/promises"; // For asynchronous file operations
// import path from "path";      // For path manipulation utilities


// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// // Get the current file's path (e.g., /var/task/lambda.mjs)
// const __filename = fileURLToPath(import.meta.url);
// // Get the directory name (e.g., /var/task/)
// const __dirname = dirname(__filename);

// const resend = new Resend(process.env.RESEND_API_KEY);


// const client = new MongoClient(process.env.MONGODB_URI);
// let db; // Variable to store the MongoDB database connection


// const LOGO_URL = "https://assets.unlayer.com/projects/274958/1749390508668-966247.png";
// // Define your application name. This will be used in the email footer.
// const APP_NAME = "TinuMind";

// // Variable to cache the HTML email template content
// let emailTemplateHtml = null;

// export async function handler(event) {
//   console.log("Lambda function started");

//   try {
//     // Connect to MongoDB only if not already connected (reuses connection for warm starts)
//     if (!db) {
//       console.log("Connecting to MongoDB...");
//       await client.connect();
//       db = client.db(process.env.DB_NAME || "TinumindDB"); // Use DB_NAME from env or default
//       console.log("Connected to MongoDB");
//     }

//     const tasksCollection = db.collection("Tasks");
//     console.log("Accessing Tasks collection");

//     // Aggregate distinct users who have both an email and a name defined
//     console.log("Fetching distinct users...");
//     const users = await tasksCollection
//       .aggregate([
//         {
//           $match: { // Filter out documents where email or name is missing/null
//             email: { $exists: true, $ne: null },
//             name: { $exists: true, $ne: null }
//           }
//         },
//         {
//           $group: { // Group by userId to get unique users
//             _id: "$userId",
//             email: { $first: "$email" }, // Get the first email associated with this userId
//             name: { $first: "$name" },   // Get the first name associated with this userId
//           },
//         },
//       ])
//       .toArray();

//     console.log(`Found ${users.length} users`);

//     // Prepare date ranges for task counting (UTC for consistency)
//     const today = new Date();
//     const startOfToday = new Date(today.setUTCHours(0, 0, 0, 0)); // Start of today (UTC)
//     const startOfWeek = new Date(startOfToday);
//     startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay()); // Start of current week (Sunday UTC)
//     const startOfMonth = new Date(
//       startOfToday.getUTCFullYear(),
//       startOfToday.getUTCMonth(),
//       1 // First day of the current month (UTC)
//     );

//     // Read the HTML email template file once per Lambda warm start
//     if (!emailTemplateHtml) {
//         // Construct the full path to email.html using __dirname
//         const templatePath = path.join(__dirname, 'email.html');
//         emailTemplateHtml = await fs.readFile(templatePath, 'utf8');
//         console.log("Email template loaded from file.");
//     }

//     // Loop through each found user to process tasks and send emails
//     for (const user of users) {
//       // Double-check if email or name are still missing (should be prevented by $match)
//       if (!user.email || !user.name) {
//           console.warn(`Skipping user with _id: ${user._id} due to missing email or name after aggregation.`);
//           continue;
//       }
//       console.log(`Processing user: ${user.name} (${user.email})`);

//       // Get counts of tasks due today, this week, and this month for the current user
//       const [todayCount, weekCount, monthCount] = await Promise.all([
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfToday,
//             $lt: new Date(startOfToday.getTime() + 86400000), // Up to end of today (UTC)
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfWeek,
//             $lt: new Date(startOfWeek.getTime() + 7 * 86400000), // Up to end of this week (UTC)
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfMonth,
//             $lt: new Date( // Up to end of this month (UTC)
//               startOfMonth.getUTCFullYear(),
//               startOfMonth.getUTCMonth() + 1, // First day of next month
//               1
//             ),
//           },
//         }),
//       ]);

//       console.log(
//         `Counts for ${user.email} - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}`
//       );

//       // Attempt to send email if user has an email address
//       if (user.email) {
//         console.log(`Attempting to send email to ${user.email}...`);

//         // Get the current year for the copyright notice
//         const currentYear = new Date().getFullYear();

//         // Populate the HTML template with dynamic data using string replacement
//         let personalizedHtml = emailTemplateHtml
//             .replace("{{LOGO_URL}}", LOGO_URL)
//             .replace("{{USER_NAME}}", user.name || "there") // Fallback to "there" if name is unexpectedly missing
//             .replace("{{TODAY_COUNT}}", todayCount)
//             .replace("{{WEEK_COUNT}}", weekCount)
//             .replace("{{MONTH_COUNT}}", monthCount)
//             .replace(/{{APP_NAME}}/g, APP_NAME) // Use global regex for multiple replacements
//             .replace("{{CURRENT_YEAR}}", currentYear);

//         try {
//           // Send the email using Resend
//           const result = await resend.emails.send({
//             from: "TinuMind <noreply@tinumind.baymufy.com>", // Your verified sending domain
//             to: [user.email], // Recipient email address
//             subject: "📋 Your TinuMind Task Summary", // Email subject
//             html: personalizedHtml, // The beautifully designed HTML content
//             // Provide a plain text fallback for email clients that don't render HTML well
//             text: `Hi ${user.name || "there"},\n\nHere's your task summary:\n\n🗓️ Today: ${todayCount}\n📅 This Week: ${weekCount}\n🗂️ This Month: ${monthCount}\n\nKeep up the great work!\n\n- The TinuMind Team`,
//           });
//           console.log(`Email sent successfully to ${user.email}:`, result.id);
//         } catch (emailError) {
//           console.error(`Failed to send email to ${user.email}:`, emailError);
//         }
//       }
//     }

//     console.log("All email attempts completed.");
//     // Return a successful response
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Task summaries sending process completed." }),
//     };
//   } catch (err) {
//     // Log and return an error response for any unhandled exceptions
//     console.error("Error occurred in Lambda:", err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message || "Internal server error" }),
//     };
//   }
// }






















// import { MongoClient } from "mongodb";
// import { Resend } from "resend";
// import { fileURLToPath } from 'url';
// import { dirname } from 'path'; // It

// // Initialize Resend with your API key from environment variables
// const resend = new Resend(process.env.RESEND_API_KEY);

// // Initialize MongoDB client with your connection string
// const client = new MongoClient(process.env.MONGODB_URI);
// let db;

// // --- Configuration ---
// // IMPORTANT: Replace with your actual public logo URL (e.g., hosted on S3 or your website)
// const LOGO_URL = "https://assets.unlayer.com/projects/274958/1749390508668-966247.png";
// const APP_NAME = "TinuMind"; // Define your application name here

// // Store the HTML template content globally (to avoid re-reading on warm starts)
// let emailTemplateHtml = null;

// export async function handler(event) {
//   console.log("Lambda function started");

//   try {
//     // Connect to MongoDB only once (reuse connection if already connected)
//     if (!db) {
//       console.log("Connecting to MongoDB...");
//       await client.connect();
//       db = client.db(process.env.DB_NAME || "TinumindDB");
//       console.log("Connected to MongoDB");
//     }

//     const tasksCollection = db.collection("Tasks");
//     console.log("Accessing Tasks collection");

//     // Aggregate distinct users by userId with their email and name
//     console.log("Fetching distinct users...");
//     const users = await tasksCollection
//       .aggregate([
//         {
//           $match: {
//             email: { $exists: true, $ne: null },
//             name: { $exists: true, $ne: null }
//           }
//         },
//         {
//           $group: {
//             _id: "$userId",
//             email: { $first: "$email" },
//             name: { $first: "$name" },
//           },
//         },
//       ])
//       .toArray();

//     console.log(`Found ${users.length} users`);

//     // Prepare date ranges for today, week, and month (based on UTC)
//     const today = new Date();
//     const startOfToday = new Date(today.setUTCHours(0, 0, 0, 0));
//     const startOfWeek = new Date(startOfToday);
//     startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
//     const startOfMonth = new Date(
//       startOfToday.getUTCFullYear(),
//       startOfToday.getUTCMonth(),
//       1
//     );

//     // Read the HTML template file once per Lambda warm start
//     if (!emailTemplateHtml) {
//         const templatePath = path.join(__dirname, 'email.html');
//         emailTemplateHtml = await fs.readFile(templatePath, 'utf8');
//         console.log("Email template loaded from file.");
//     }

//     // Loop over each user to get counts and send email
//     for (const user of users) {
//       if (!user.email || !user.name) {
//           console.warn(`Skipping user with _id: ${user._id} due to missing email or name.`);
//           continue;
//       }
//       console.log(`Processing user: ${user.name} (${user.email})`);

//       // Get counts of tasks due today, this week, and this month
//       const [todayCount, weekCount, monthCount] = await Promise.all([
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfToday,
//             $lt: new Date(startOfToday.getTime() + 86400000),
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfWeek,
//             $lt: new Date(startOfWeek.getTime() + 7 * 86400000),
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfMonth,
//             $lt: new Date(
//               startOfMonth.getUTCFullYear(),
//               startOfMonth.getUTCMonth() + 1,
//               1
//             ),
//           },
//         }),
//       ]);

//       console.log(
//         `Counts for ${user.email} - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}`
//       );

//       if (user.email) {
//         console.log(`Attempting to send email to ${user.email}...`);

//         // Populate the HTML template with dynamic data
//         const currentYear = new Date().getFullYear();
//         let personalizedHtml = emailTemplateHtml
//             .replace("{{LOGO_URL}}", LOGO_URL)
//             .replace("{{USER_NAME}}", user.name || "there")
//             .replace("{{TODAY_COUNT}}", todayCount)
//             .replace("{{WEEK_COUNT}}", weekCount)
//             .replace("{{MONTH_COUNT}}", monthCount)
//             .replace(/{{APP_NAME}}/g, APP_NAME) // Use /g for global replacement for APP_NAME
//             .replace("{{CURRENT_YEAR}}", currentYear);


//         try {
//           const result = await resend.emails.send({
//             from: "TinuMind <noreply@tinumind.baymufy.com>",
//             to: [user.email],
//             subject: "📋 Your TinuMind Task Summary",
//             html: personalizedHtml,
//             text: `Hi ${user.name || "there"},\n\nHere's your task summary:\n\n🗓️ Today: ${todayCount}\n📅 This Week: ${weekCount}\n🗂️ This Month: ${monthCount}\n\nKeep up the great work!\n\n- TinuMind`,
//           });
//           console.log(`Email sent successfully to ${user.email}:`, result.id);
//         } catch (emailError) {
//           console.error(`Failed to send email to ${user.email}:`, emailError);
//         }
//       }
//     }

//     console.log("All email attempts completed.");
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Task summaries sending process completed." }),
//     };
//   } catch (err) {
//     console.error("Error occurred in Lambda:", err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message || "Internal server error" }),
//     };
//   }
// }


















// import { MongoClient } from "mongodb";
// import { Resend } from "resend";

// // Initialize Resend with your API key from environment variables
// const resend = new Resend(process.env.RESEND_API_KEY);

// // Initialize MongoDB client with your connection string
// const client = new MongoClient(process.env.MONGODB_URI);
// let db;

// export async function handler(event) {
//   console.log("Lambda function started");

//   try {
//     // Connect to MongoDB only once (reuse connection if already connected)
//     if (!db) {
//       console.log("Connecting to MongoDB...");
//       await client.connect();
//       db = client.db(process.env.DB_NAME || "TinumindDB");
//       console.log("Connected to MongoDB");
//     }

//     const tasksCollection = db.collection("Tasks");
//     console.log("Accessing Tasks collection");

//     // Aggregate distinct users by userId with their email and name
//     console.log("Fetching distinct users...");
//     const users = await tasksCollection
//       .aggregate([
//         {
//           // Add a match stage to ensure email and name exist and are not null
//           $match: {
//             email: { $exists: true, $ne: null },
//             name: { $exists: true, $ne: null }
//           }
//         },
//         {
//           $group: {
//             _id: "$userId",           // Group by userId
//             email: { $first: "$email" }, // Get first email found for that userId
//             name: { $first: "$name" },   // Get first name found for that userId
//           },
//         },
//       ])
//       .toArray();

//     console.log(`Found ${users.length} users`);

//     // Prepare date ranges for today, week, and month (based on UTC)
//     const today = new Date();
//     const startOfToday = new Date(today.setUTCHours(0, 0, 0, 0)); // Use UTC for consistency
//     const startOfWeek = new Date(startOfToday);
//     startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay()); // Sunday UTC
//     const startOfMonth = new Date(
//       startOfToday.getUTCFullYear(),
//       startOfToday.getUTCMonth(),
//       1
//     );

//     // Loop over each user to get counts and send email
//     for (const user of users) {
//       // Skip if email or name is still null after aggregation (though the $match should prevent this)
//       if (!user.email || !user.name) {
//           console.warn(`Skipping user with _id: ${user._id} due to missing email or name.`);
//           continue;
//       }
//       console.log(`Processing user: ${user.name} (${user.email})`);

//       // Get counts of tasks due today, this week, and this month
//       const [todayCount, weekCount, monthCount] = await Promise.all([
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfToday,
//             $lt: new Date(startOfToday.getTime() + 86400000), // next day (24 hours)
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfWeek,
//             $lt: new Date(startOfWeek.getTime() + 7 * 86400000), // next week (7 days)
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfMonth,
//             $lt: new Date(
//               startOfMonth.getUTCFullYear(),
//               startOfMonth.getUTCMonth() + 1,
//               1
//             ), // next month (first day of next month)
//           },
//         }),
//       ]);

//       console.log(
//         `Counts for ${user.email} - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}`
//       );

//       // Send email only if email exists
//       if (user.email) {
//         console.log(`Attempting to send email to ${user.email}...`);
//         try {
//           const result = await resend.emails.send({
//             from: "TinuMind <noreply@tinumind.baymufy.com>",
//             to: [user.email],
//             subject: "📋 Your TinuMind Task Summary",
//             text: `Hi ${user.name || "there"},\n\nHere's your task summary:\n\n🗓️ Today: ${todayCount}\n📅 This Week: ${weekCount}\n🗂️ This Month: ${monthCount}\n\nKeep up the great work!\n\n- TinuMind`,
//           });
//           console.log(`Email sent successfully to ${user.email}:`, result.id); // Log only ID for brevity
//         } catch (emailError) {
//           console.error(`Failed to send email to ${user.email}:`, emailError);
//         }
//       }
//     }

//     console.log("All email attempts completed.");
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Task summaries sending process completed." }),
//     };
//   } catch (err) {
//     console.error("Error occurred in Lambda:", err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message || "Internal server error" }),
//     };
//   } finally {
//       // It's good practice to close the MongoDB client connection if it was opened
//       // though Lambda's lifecycle often reuses connections.
//       // If you run into issues with Lambda not terminating, consider closing here.
//       // For now, let's assume persistent connection is desired for performance.
//       // if (client) {
//       //   await client.close();
//       // }
//   }
// }





































// import { MongoClient } from "mongodb";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// const client = new MongoClient(process.env.MONGODB_URI);
// let db;

// export async function handler(event) {
//   console.log("Lambda function started");

//   try {
//     if (!db) {
//       console.log("Connecting to MongoDB...");
//       await client.connect();
//       db = client.db(process.env.DB_NAME || "TinumindDB");
//       console.log("Connected to MongoDB");
//     }

//     const tasksCollection = db.collection("Tasks");
//     console.log("Accessing Tasks collection");

//     // Get all users (grouped by userId & email)
//     console.log("Fetching distinct users...");
//     const users = await tasksCollection
//       .aggregate([
//         {
//           $group: {
//             _id: "$userId",
//             email: { $first: "$email" },
//             name: { $first: "$name" },
//           },
//         },
//       ])
//       .toArray();
//     console.log(`Found ${users.length} users`);

//     const today = new Date();
//     const startOfToday = new Date(today.setHours(0, 0, 0, 0));
//     const startOfWeek = new Date(startOfToday);
//     startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
//     const startOfMonth = new Date(
//       startOfToday.getFullYear(),
//       startOfToday.getMonth(),
//       1
//     );

//     for (const user of users) {
//       console.log(`Processing user: ${user.name} (${user.email})`);

//       const [todayCount, weekCount, monthCount] = await Promise.all([
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfToday,
//             $lt: new Date(startOfToday.getTime() + 86400000),
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfWeek,
//             $lt: new Date(startOfWeek.getTime() + 7 * 86400000),
//           },
//         }),
//         tasksCollection.countDocuments({
//           userId: user._id,
//           dueDate: {
//             $gte: startOfMonth,
//             $lt: new Date(
//               startOfMonth.getFullYear(),
//               startOfMonth.getMonth() + 1,
//               1
//             ),
//           },
//         }),
//       ]);

//       console.log(
//         `Counts for ${user.email} - Today: ${todayCount}, Week: ${weekCount}, Month: ${monthCount}`
//       );

//       if (user.email) {
//         console.log(`Sending email to ${user.email}...`);
//         const result = await resend.emails.send({
//           from: "TinuMind <onboarding@resend.dev>",
//           to: [user.email],
//           subject: "📋 Your TinuMind Task Summary",
//           text: `Hi ${user.name || "there"},\n\nHere's your task summary:\n\n🗓️ Today: ${todayCount}\n📅 This Week: ${weekCount}\n🗂️ This Month: ${monthCount}\n\nKeep up the great work!\n\n- TinuMind`,
//         });
//         console.log(`Email sent to ${user.email}:`, result);
//       }
//     }

//     console.log("All emails sent successfully.");
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Task summaries sent successfully." }),
//     };
//   } catch (err) {
//     console.error("Error occurred in Lambda:", err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: err.message || "Internal server error" }),
//     };
//   }
// }
