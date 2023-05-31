import {describe, it, beforeAll, afterEach, afterAll, expect} from 'vitest'
import {FastifyInstance} from "fastify";
// @ts-ignore
import request from "supertest";

import startFastify from '../src/server'
import mongoose from "mongoose";

import * as VideoService from '../src/services/video-service'


describe('Server status', () => {
    let app: FastifyInstance

    beforeAll(async () => {
        app = startFastify({
            port: 8888,
            host: '0.0.0.0',
            mongoConnectionString: 'mongodb://localhost:27017/mernBacked'
        })

        await app.ready()
    })

    it('Given an empty db, GET /videos return 200 and empty array', async () => {
        // Act
        const res = await request(app.server).get('/api/v1/videos');

        // Assert
        expect(res.statusCode).toBe(200)
    })

    // afterEach(async () => {
    //     mongoose.models.Video.deleteMany()
    // })

    afterAll(async () => {
        await mongoose.disconnect()
        await app.close()
    })
})