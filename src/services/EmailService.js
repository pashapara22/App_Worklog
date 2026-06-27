/**
 * Simulated Email Service
 * 
 * In a real production app with a backend, this would make an API call (e.g. to a Node.js endpoint using SendGrid/AWS SES).
 * For a frontend-only React app, you can drop in a service like EmailJS (https://www.emailjs.com/) here.
 * 
 * For this prototype, we simulate the email by formatting it beautifully in the browser console 
 * and returning a success promise.
 */

export const EmailService = {
  /**
   * Send the 9:00 AM friendly reminder to start logging.
   */
  sendMorningReminder: async (instructorName, instructorEmail) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.group(`%c📧 EMAIL SENT TO: ${instructorEmail}`, 'color: #3b82f6; font-weight: bold; font-size: 12px;');
        console.log(`%cSubject:`, 'font-weight: bold;', `Good morning ${instructorName}! Don't forget your worklog.`);
        console.log(`%cBody:`, 'font-weight: bold;', 
`Hi ${instructorName},

This is an automated reminder from the Instructor Worklog Platform.
Please make sure to log your activities throughout the day!

Best,
Admin Team`);
        console.groupEnd();
        resolve({ success: true, type: 'morning' });
      }, 500); // 500ms network delay simulation
    });
  },

  /**
   * Send the 6:30 PM alert for incomplete logs.
   */
  sendEveningAlert: async (instructorName, instructorEmail, missingCount) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.group(`%c🚨 ALERT EMAIL SENT TO: ${instructorEmail}`, 'color: #ef4444; font-weight: bold; font-size: 12px;');
        console.log(`%cSubject:`, 'font-weight: bold;', `ACTION REQUIRED: Incomplete Worklog`);
        console.log(`%cBody:`, 'font-weight: bold;', 
`Hi ${instructorName},

Our automated system noticed that it is past 6:30 PM and you still have ${missingCount} incomplete slots on your daily worklog.
Please log in to the portal and submit your daily activities as soon as possible for compliance tracking.

Thank you,
Admin Team`);
        console.groupEnd();
        resolve({ success: true, type: 'evening' });
      }, 500);
    });
  }
};
