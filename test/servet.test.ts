import {describe, it, beforeAll, afterEach, afterAll, expect} from 'vitest'
import {FastifyInstance} from "fastify";
// @ts-ignore
import request from "supertest";

import startFastify from '../src/server'
import mongoose from "mongoose";

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

    afterAll(async () => {
        await mongoose.disconnect()
        await app.close()
    })
})