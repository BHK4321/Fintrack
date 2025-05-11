const today = new Date;

export const prompt = `Please answer in checkpoints where each checkpoint is enclosed within curly braces: "{}".
            Start with the checkpoints only nothing else.
            Only give checkpoints with the format described and nothing else.
            Give the checkpoints in such a way completing the checkpoint will increase the saved amount by the same amount at each step.
            You don't have to give suggestions, you have to give complete step-wise procedure to reach the goal.
            Give practical Steps for me to acheive the goal amount by the date mentioned.
            CURRENT DATE : ${today}.
            Go through the goal description properly and try best to give complete steps for acheiving it.
            Search through various methods for growing capital.
            You can also say it is "NOT ACHEIVABLE" only when you are not able to find any solution and the goal is not acheivable by any means.
            Here are some sources:
            https://www.investopedia.com/
            https://finance.yahoo.com/
            https://www.morningstar.com/
            https://www.morningstar.com/
            https://zerodha.com/varsity/
            https://zerodha.com/varsity/modules/
            https://zerodha.com/varsity/module/personalfinance/
            https://zerodha.com/varsity/module/insurance/
            https://www.tickertape.in/
            `;
