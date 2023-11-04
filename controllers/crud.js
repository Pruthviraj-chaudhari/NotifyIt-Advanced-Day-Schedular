const User = require("../models/user");
const bodyParser = require("body-parser");
const date = require("../utils/date");
const passport = require("passport");
const mailSender = require('../utils/mailsender');
const alertTemplate = require("../mailTemplates/alertTemplate"); 

exports.addTodo = async (req, res) => {
    const newItem = req.body.newItem;
    const deadline = req.body.timeInput;

    if (!isValidDeadline(deadline)) {
        return res.status(400).send('Invalid deadline');
    }

    if (!newItem || newItem.trim() === '') {
        return res.redirect('/todo');
    }

    const item = { name: newItem, deadline };

    User.findOneAndUpdate(
        { _id: req.user.id, email: req.user.email },
        { $push: { items: item } },
        { new: true } // returns updated list
    )
        .then(async (updatedList) => {
            if (updatedList) {
                console.log('New Item Added');
                // Schedule a notification 5 minutes before the deadline
                scheduleNotification(updatedList, item);
            } else {
                console.log('Cannot Add Item');
            }
            res.redirect('/todo');
        })
        .catch((err) => {
            console.log('Error finding/updating Items:', err);
            res.redirect('/todo');
        });
};

exports.getTodo = async (req, res) => {
    
    if (req.isAuthenticated || req.isAuthenticated()) {
        
        User.findById(req.user.id)
            .then((foundUser) => {
                if (foundUser && foundUser.items.length === 0) {
                    const defaultItems = [
                        { name: "Hey👋 " + req.user.name },
                        { name: "Welcome to your todolist 💝" }
                    ];
                    foundUser.items = defaultItems;
                    foundUser.save()
                        .then(() => { console.log("Default Items Inserted Successfully") })
                        .catch(error => { console.log("Error Inserting Documents: ", error) });
                }

                const formatedDate = date.getDate();
                console.log("User login successfully");
                res.render("list", { listTitle: formatedDate, listArray: foundUser.items });
            })
            .catch(err => {
                console.log("Error Finding Documents: ", err);
                res.redirect("/");
            });

    } else {
        // If not authenticated, redirect to the home page
        res.redirect("/");
    }
}

exports.deleteTodo = async (req, res) => {
    const userId = req.user.id;
    const checkboxID = req.body.checkboxID;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { items: { _id: checkboxID } } },
            { new: true }
        );
        console.log("Item deleted from the database");
        res.redirect('/todo');
    } catch (err) {
        console.error('Error deleting item:', err);
        res.redirect('/todo');
    }
}

// Function to check if the deadline is a valid HH:mm time format
function isValidDeadline(deadline) {
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    return timePattern.test(deadline);
}

// Function to schedule a notification 5 minutes before the deadline
// function scheduleNotification(user, item) {
//     const fiveMinutesBeforeDeadline = new Date();
//     const [hours, minutes] = item.deadline.split(':').map(Number);
//     fiveMinutesBeforeDeadline.setHours(hours, minutes - 5, 0, 0);

//     const currentTime = new Date();

//     if (fiveMinutesBeforeDeadline > currentTime) {
//         // Calculate the delay until the notification
//         const delayInMilliseconds = fiveMinutesBeforeDeadline - currentTime;

//         // Schedule the notification
//         setTimeout(() => {
//             sendNotification(user, item);
//         }, delayInMilliseconds);
//     }
// }

// Function to schedule a notification if deadline is in less than 5 minutes 
function scheduleNotification(user, item) {

    const [hours, minutes] = item.deadline.split(':').map(Number);

    const deadlineTime = new Date();
    deadlineTime.setHours(hours, minutes, 0, 0);

    const fiveMinutesBeforeDeadline = new Date(deadlineTime);
    fiveMinutesBeforeDeadline.setMinutes(deadlineTime.getMinutes() - 5);

    const currentTime = new Date();

    if (fiveMinutesBeforeDeadline <= currentTime) {
        sendNotification(user, item);
    }
}

// Function to send email notifications using mailSender
function sendNotification(user, item) {
    const email = user.email;
    const name = user.name;
    const title = 'Task Alert';
    const body = alertTemplate(name, item.name, item.deadline);

    mailSender(email, title, body)
        .then((info) => {
            console.log(`Alert Email sent to ${user.name}`);
        })
        .catch((error) => {
            console.error('Error sending alert email:', error.message);
        });
}