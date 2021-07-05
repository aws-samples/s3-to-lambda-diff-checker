/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

const { compareS3 } = require('./compareS3')
const { deleteS3 } = require('./deleteS3')

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION 
const s3 = new AWS.S3()

const processS3 = async (record) => {
  try {
    // Decode URL-encoded key
    const Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "))

    // Get the list of object versions
    const data = await s3.listObjectVersions({
      Bucket: record.s3.bucket.name,
      Prefix: Key
    }).promise()

    console.log (JSON.stringify(data, null, 2))
    
   // Sort versions by date (ascending by LastModified)
    const versions = data.Versions
    const sortedVersions = versions.sort((a,b) => new Date(a.LastModified) - new Date(b.LastModified))

    // Add version number
    for (let i = 0; i < sortedVersions.length; i++) {
      sortedVersions[i].VersionNumber = i + 1
      sortedVersions[i].BucketName = record.s3.bucket.name
    }
    console.log(sortedVersions)
    
    // Get diff of last two versions
    const result = await compareS3(sortedVersions[sortedVersions.length - 2], sortedVersions[sortedVersions.length - 1])
    console.log('Diff: ', result)

    // Only continue there are more versions that we should keep
    if (data.Versions.length <= process.env.KEEP_VERSIONS) {
      return console.log("Not enough versions for deletion - exit")
    }

    // Delete older versions
    await deleteS3(sortedVersions)
    
  } catch (err) {
    console.error(err)
  }
}

module.exports = { processS3 }


