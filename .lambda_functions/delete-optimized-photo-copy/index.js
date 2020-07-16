let AWS = require('aws-sdk'),
    s3 = new AWS.S3();

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));
    // Get the object from the event and show its content type
    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey = event.Records[0].s3.object.key;

    let params = {
        Bucket: 'ucla-bookstack-optimized-photos',
        Key: srcKey
    };
    s3.deleteObject(params, function(err, data) {
        if (err) console.log(err, err.stack);  // error

        else {console.log();}               // deleted
    });

    callback(null, "Succesfully deleted!")
};