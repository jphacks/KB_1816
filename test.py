#Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)

import boto3
import json

if __name__ == "__main__":

    imageFile='tmp/akito.jpg'
    imageName='akito.jpg'
    client=boto3.client('rekognition')
    bucket = "lnebot-rekognition"

    s3 = boto3.client('s3')

    with open(imageFile, 'rb') as data:
    	s3.upload_fileobj(data, bucket, imageName)


    
    response = client.detect_faces(Image={'S3Object':{'Bucket':bucket,'Name':imageName}},Attributes=['ALL'])

       
    for faceDetail in response['FaceDetails']:
        print('The detected face is between ' + str(faceDetail['AgeRange']['Low']) 
              + ' and ' + str(faceDetail['AgeRange']['High']) + ' years old')
        print('Here are the other attributes:')
        emotions = faceDetail['Emotions']
        for emotion in emotions:
        	if emotion['Type'] == 'HAPPY':
        		emo = emotion['Confidence'] 
        print('幸福度:' + str(round(emo, 2)) + '%')









    # with open(imageFile, 'rb') as image:
    #     response = client.detect_Faces(Image={'Bytes': image.read()})
        
    # print('Detected labels in ' + imageFile)   



    # for label in response['Labels']:
    # 	key_list = label.keys()
    # 	# print(key_list)
    #     # print (label['Name'] + ' : ' + str(label['Confidence']))

    # print('Done...')