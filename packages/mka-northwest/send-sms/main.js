const {MongoClient} = require('mongodb');

exports.main = async () => {
    console.log("...Initiating Function...");

    let khuddam = await getAllKhuddam();
    console.log(khuddam);

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
