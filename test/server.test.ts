import {describe, it, beforeAll, afterEach, afterAll, expect} from 'vitest'
import {FastifyInstance} from "fastify";
// @ts-ignore
import request from "supertest";

import startFastify from '../src/server'
import mongoose from "mongoose";
import {SearchTag} from "../src/types/search-tag";

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

    it('Health Check /hc return healthy', async () => {
        const res = await request(app.server).get('/hc')
        expect(res.body['msg']).toBe('healthy')
    })

    it('GET /tags return 200 and complete search tag list', async () => {
        // Act
        const res = await request(app.server).get('/tags')
        const body = res.body;
        const tags = body['searchTags'];
        const sample = Object.values(SearchTag);

        // Assert
        expect(res.statusCode).toBe(200)
        expect(body).toEqual({searchTags: expect.arrayContaining(sample)})
        expect(tags).toHaveLength(sample.length)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await app.close()
    })
})