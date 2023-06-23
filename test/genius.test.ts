import * as dbHandler from 'testcontainers-mongoose'
import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';
import {FastifyInstance} from "fastify";
// @ts-ignore
import request from "supertest";

import startFastify from '../src/server'
import GeniusModel from "../src/models/genius-model";
import {PostGeniusDto, PostSayNoNoDto} from "../src/types/genius-dto";


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

    const baseUrl = '/api/v1/genius';
    it('Given an empty db, GET /genius return 200 and empty array', async () => {
        // Act
        const res = await request(app.server).get(baseUrl);

        // Assert
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveLength(0)
    })

    it('Given a 3 element db, GET /genius return 200 and exact 3 element array', async () => {
        // Arrange
        const geniuses: PostGeniusDto[] = [
            { name: 'Chen Wan', joinDate: new Date('2022-05-15') },
            { name: 'Wan Ming', joinDate: new Date('2021-11-22') },
            { name: 'Gin Yin', joinDate: new Date('2020-07-31') }
        ]
        await GeniusModel.insertMany(geniuses)

        // Act
        const res = await request(app.server).get(baseUrl)
        const fetchBackGeniuses = res.body

        // Assert
        expect(res.statusCode).toBe(200)
        expect(fetchBackGeniuses).toHaveLength(3)
    })

    it('POST /genius return 201 and created genius', async () => {
        // Arrange
        let date = new Date('2019-09-02');
        const dto: PostGeniusDto = { name: 'WQ', joinDate: date}

        // Act
        const res = await request(app.server).post(baseUrl).send(dto)
        const returnGenius = res.body

        // Assert
        expect(res.statusCode).toBe(201)
        expect(returnGenius['name']).toBe('WQ')

        const returnDate = new Date(returnGenius['joinDate'])
        expect(returnDate.getTime()).toBe(date.getTime())
    })

    it('POST /genius/memberStatus/say-no-no make memberStatus populated when GET /genius', async () => {
        // Arrange
        const geniusDto: PostGeniusDto = { name: 'WQ', joinDate:  new Date('2019-09-02')}
        const geniusRes = await request(app.server).post(baseUrl).send(geniusDto)
        const returnGenius = geniusRes.body

        const memberStatusDto: PostSayNoNoDto = {
            genius_Id: returnGenius.genius_Id,
            issueDate: new Date('2020-11-12'),
            toBeReject: 'YH',
            coolDownUntilDate: new Date('2023-11-30')
        }

        // Act
        const memberStatusRes = await request(app.server).post(`${baseUrl}/memberStatus/say-no-no`).send(memberStatusDto)
        const res = await request(app.server).get(baseUrl)

        // Assert
        const fetchBackGenius = res.body[0]
        expect(fetchBackGenius['latestMemberStatus']['kind']).toBe('SayNoNo')
    })

    afterEach(async () => {
        await dbHandler.clearDatabase()
    })

    afterAll(async () => {
        await dbHandler.closeDatabase()
        await app.close()
    })
})