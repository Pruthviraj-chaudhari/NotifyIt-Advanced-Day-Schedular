const alertTemplate = (taskName, deadline) => {
	return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Task Alert</title>
        <style>
            html {
                background-color: #E4E9FD;
                background-image: -webkit-linear-gradient(65deg, #A683E3 50%, #E4E9FD 50%);
                min-height: 100vh;
                font-family: 'helvetica neue';
            }
    
            body {
    
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
    
            #heading {
                background-color: #A683E3;
                text-align: center;
            }
    
            h1 {
                color: #fff;
                padding: 10px;
                text-align: center;
            }
    
            .box {
                max-width: 400px;
                margin: 50px auto;
                background: white;
                border-radius: 5px;
                box-shadow: 5px 5px 15px -5px rgba(0, 0, 0, 0.3);
            }
    
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <div class="box" id="heading">
                <h1>Task Alert</h1>
            </div>
            <div class="message">Task Alert</div>
            <div class="body">
                <p>Dear User,</p>
                <p>You have a task with an upcoming deadline:</p>
                <div class="task">
                    Task: ${taskName}
                </div>
                <div class="task">
                    Deadline: ${deadline}
                </div>
                <p>Make sure to complete the task on time to stay organized and on top of your to-do list.</p>
                <p>If you've already completed the task, you can mark it as done in your Todo App.</p>
            </div>
            <div class="support">If you have any questions or need assistance, please feel free to contact us at <a
                href="mailto:info@todoapp.com">info@todoapp.com</a>.</div>
        </div>
    
    </body>
    
    </html>`;
};

module.exports = alertTemplate;    