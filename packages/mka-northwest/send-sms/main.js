const {MongoClient} = require('mongodb');

exports.main = async (args) => {
    console.log("...Initiating Function...");

    let khuddam = await getAllKhuddam();
    dispatchMessage(khuddam, args.message);
    return {"body": "Done!"}
}


async function getAllKhuddam() {
    const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`;

    const client = new MongoClient(uri);

    try {
        await client.connect();

        return await client
                        .db("mka-northwest")
                        .collection('khuddam')
                        .find({})
                        .toArray(); 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

function dispatchMessage(userArray, message) {

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    const twilio = require("twilio");
    const client = new twilio(accountSid, authToken);

    userArray.forEach((element) => {

        element.phone = sanitizePhoneNumber(element.phone);

        //avoid sending message to incorrect or placeholder phone numbers
        if (!element.phone) return;

        client.messages
        .create({
            body: formatMessage(message, element),
            to: element.phone, // Text this number
            messagingServiceSid: process.env.TWILIO_SERVICE_SID,
        })

    });
}

function sanitizePhoneNumber(number) {
    let filtered = number.match(/\d+/g).join("") //extract only numbers
    
    if (filtered.length == 10) {
      // phone number is in the form: 3601231234
      //  add +1 to the number
      filtered = "+1" + filtered
    } else if (filtered.length == 11) {
      // phone number is in the form: 13601231234
      // add + to the number
      filtered = "+" + filtered
    } else {
      // bad phone number, do not include
      filtered = undefined;
    }
    return filtered;
}

function formatMessage(message, userObject) {
    message = message.replace(/{{\w+}}/g, function(param) {
		param = param.substring(2, param.length-2); //remove {{ and }}
        return userObject[param];
    });

    return message;
}
