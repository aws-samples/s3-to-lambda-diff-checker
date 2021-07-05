/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

const Diff = require('diff')
const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION 
const s3 = new AWS.S3()

const deleteS3 = async (versions) => {

  // Params for deleteObjects method
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObjects-property

  const params = {
    Bucket: versions[0].BucketName, 
    Delete: {
     Objects: [ ]
    }
  }

  try {
    console.log (`deleteS3 called: keep last ${process.env.KEEP_VERSIONS} versions`)

    // Add keys/versions from objects that are process.env.KEEP_VERSIONS behind
    versions.map((version) => {
      if ((versions.length - version.VersionNumber) >= process.env.KEEP_VERSIONS ) {
        console.log(`Delete version ${version.VersionNumber}: versionId = ${version.VersionId}`)
        params.Delete.Objects.push({ 
          Key: version.Key,
          VersionId: version.VersionId
        })
      }
    })

    // Preview the params object
    console.log(JSON.stringify(params, null, 2))

    // Delete versions
    const result = await s3.deleteObjects(params).promise()
    console.log('Delete object result: ', result)

  } catch (err) {
    console.error('compareS3: ', err)
  }
}

module.exports = { deleteS3 }