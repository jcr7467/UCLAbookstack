const gm = require('gm').subClass({ imageMagick: true });
let AWS = require('aws-sdk');

let s3 = new AWS.S3();


const root    = process.env['LAMBDA_TASK_ROOT'];
const path    = process.env['PATH'];
const libPath = process.env['PATH'];

// change the Lambda Runtime to use pre-built binary
process.env['PATH']            = `${root}/bin:${path}`;
process.env['LD_LIBRARY_PATH'] = `${root}/lib:${libPath}`;

// convert HEIC to JPEG
exports.handler = (event, context, callback) => {

  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = event.Records[0].s3.object.key;

  let typeMatch = srcKey.match(/\.([^.]*)$/);
 
  if (!typeMatch) {
        console.error('unable to infer image type for key ' + srcKey);
        return;
  }

  let imageType = typeMatch[1].toLowerCase();

  if (imageType !== "heic") {
        console.log('not an heic image');
        return;
  }else{

    s3.getObject({Bucket: srcBucket, Key: srcKey}).promise()
    .then(data => {
      
    })
    .catch(err => {
	console.log(err)
    })



    let [ path ] = event.img.split('.');
    gm(event.img).write(`${path}.jpeg`, (err) => console.error(err));
    
  }

};
