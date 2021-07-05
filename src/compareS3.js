/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

const Diff = require('diff')
const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION 
const s3 = new AWS.S3()

const compareS3 = async (oldVersion, newVersion) => {
  try {
    console.log ({oldVersion, newVersion})

    // Get original text from objects 
    const oldObject = await s3.getObject({ Bucket: oldVersion.BucketName, Key: oldVersion.Key }).promise()
    const newObject = await s3.getObject({ Bucket: newVersion.BucketName, Key: newVersion.Key }).promise()

    // Convert buffers to strings
    const oldFile = oldObject.Body.toString()
    const newFile = newObject.Body.toString()

    // Use diff library to compare files (https://www.npmjs.com/package/diff)
    return Diff.diffWords(oldFile, newFile)

  } catch (err) {
    console.error('compareS3: ', err)
  }
}

module.exports = { compareS3 }