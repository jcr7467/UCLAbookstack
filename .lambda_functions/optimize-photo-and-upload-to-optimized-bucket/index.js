// dependencies
let async = require('async'),
    AWS = require('aws-sdk'),
    jimp = require('jimp');

// get reference to S3 client
let s3 = new AWS.S3();


// AWS Lambda runs this on every new file upload to s3
exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));


    // Get the object from the event and show its content type
    const srcBucket = event.Records[0].s3.bucket.name;
    const srcKey = event.Records[0].s3.object.key;


    // Infer the image type.
    let typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.error('unable to infer image type for key ' + srcKey);
        return;
    }


    let imageType = typeMatch[1].toLowerCase();
    if (imageType !== "jpg" && imageType !== "png" && imageType !== "jpeg") {
        console.log('skipping non-image ' + srcKey);
        return;
    }

    async.waterfall([
        function download(next){
        //Download s3 picture into buffer
            s3.getObject({Bucket:srcBucket, Key: srcKey}, (err, data) => {

                if(err){next('Error getting file: ' + err, null);}

                next(null, data);
            })
        },
        function manipulate(data, next){
        //This is where image is rotated and quality is reduced
            jimp.read(data.Body).then((image) => {
                image.quality(70)
                     .exifRotate()
                     .resize(550, jimp.AUTO)
                     .getBuffer(jimp.AUTO,(err, buffer) => {
                        if(err){next(err, null);}
                        else{
                            next(null, data.ContentType, buffer);
                        }
                     })
            }).catch(function (err) {
                next(err, null)
            });
        },
        function upload(contentType, buffer, next){
        //Finally, the file is saved and uploaded to a bucket
            const params = {
                Bucket: 'ucla-bookstack-optimized-photos',
                Key:  srcKey,
                Body: buffer,
                ContentType:contentType
            };
            s3.putObject(params, function (err, data) {
                if (err) {
                    next("Error uploading image: " + err, null);
                } else {
                    console.log("Successfully uploaded image on S3", data);
                    // call AWS Lambda's callback, function was successful!!!
                    next(null);
                }
            });
        }
    ],
        (err) => {
        if(err){callback(err)}
        else{
            callback(null, 'Operation was successful!!')
        }
    });
};