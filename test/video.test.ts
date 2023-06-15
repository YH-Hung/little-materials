import * as dbHandler from 'testcontainers-mongoose'
import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest'
import {FastifyInstance} from "fastify";
// @ts-ignore
import request from "supertest";

import startFastify from '../src/server'
import mongoose from "mongoose";
import VideoModel from '../src/models/video-model'
import {Video, VideoBody} from "../src/types/video";
import {SearchTag} from "../src/types/search-tag";


function videoGenerator(no: number): Array<VideoBody> {
    return [
        { title: 'Functional programming 22', link: 'http://youtu.be/12345', tags: [ SearchTag.FunctionalProgramming ] },
        { title: 'Testing Testing', link: 'http://youtu.be/1089473', tags: [ SearchTag.Testing, SearchTag.Kotlin ] },
        { title: 'Domain Modeling made Functional', link: 'http://youtu.be/adcike', tags: [ SearchTag.FunctionalProgramming, SearchTag.DomainModeling ] }
    ]
}

describe('Video API', () => {
    let app: FastifyInstance

    beforeAll(async () => {
        app = startFastify({
            port: 8888,
            host: '0.0.0.0',
            mongoConnectionString: 'mongodb://localhost:27017/mernBacked'
        })

        await dbHandler.connect('mongo:6.0.6')
        await app.ready()
    })

    const baseUrl = '/api/v1/videos';
    it('Given an empty db, GET /videos return 200 and empty array', async () => {
        // Act
        const res = await request(app.server).get(baseUrl);

        // Assert
        expect(res.statusCode).toBe(200)
        expect(res.body['videos']).toHaveLength(0)
    })

    it('Given a 3 element db, GET /video return 200 and exact 3 element array', async () => {
        // Arrange
        const videos = videoGenerator(3)
        await VideoModel.insertMany(videos)

        // Act
        const res = await request(app.server).get(baseUrl);
        const fetchBackVideos = res.body['videos']

        // Assert
        expect(res.statusCode).toBe(200)
        expect(fetchBackVideos).toHaveLength(3)
    })

    it('Given an empty db, POST /videos made db contain 1 element, then return 201 with new video object', async () => {
        // Arrange
        const newBody = { title: 'Functional programming 22', link: 'http://youtu.be/12345', tags: [ SearchTag.FunctionalProgramming ] }

        // Act
        const res = await request(app.server).post(baseUrl).send(newBody)
        const returnVideo = res.body['video'] as Video
        const videoInDb = await VideoModel.findById(returnVideo.id)

        // Assert
        expect(res.statusCode).toBe(201)
        expect(videoInDb).not.toBeNull()
    })

    it('POST /videos with invalid tag should return 400', async () => {
        // Arrange
        const newBody = { title: 'Functional programming 22', link: 'http://youtu.be/12345', tags: [ 'bubu' ] }

        // Act
        const res = await request(app.server).post(baseUrl).send(newBody)

        // Assert
        expect(res.statusCode).toBe(400)
    })

    afterEach(async () => {
        await dbHandler.clearDatabase()
    })

    afterAll(async () => {
        await dbHandler.closeDatabase()
        await app.close()
    })
})