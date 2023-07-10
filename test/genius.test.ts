import * as dbHandler from 'testcontainers-mongoose'
import {afterAll, afterEach, beforeAll, describe, expect, it} from 'vitest';
import {FastifyInstance} from "fastify";
// @ts-ignore
import request from "supertest";

import startFastify from '../src/server'
import GeniusModel from "../src/models/genius-model";
import {
    PostAssignedTaskDto,
    PostGeniusBarDto,
    PostGeniusDto,
    PostSayNoNoDto,
    PostWorkFromHomeDto, PutTaskReleaseDto
} from "../src/types/genius-dto";
import {inspect} from "util";


describe('Genius API', () => {
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

    it('POST /genius/memberStatus append new status when previous status is valid', async () => {
        // Arrange
        const geniusDto: PostGeniusDto = { name: 'WQ', joinDate:  new Date('2019-09-02')}
        const geniusRes = await request(app.server).post(baseUrl).send(geniusDto)
        const returnGenius = geniusRes.body

        const sayNoNoDto: PostSayNoNoDto = {
            genius_Id: returnGenius['_id'],
            kind: 'SayNoNo',
            issueDate: new Date('2020-11-12'),
            toBeReject: 'YH',
            coolDownUntilDate: new Date('2023-11-30')
        }

        const geniusBarDto: PostGeniusBarDto = {
            genius_Id: returnGenius['_id'],
            kind: 'GeniusBar',
            issueDate: new Date('2020-11-13'),
            resolvedIssues: 10
        }

        const workFromHomeDto: PostWorkFromHomeDto = {
            genius_Id: returnGenius['_id'],
            kind: 'WorkFromHome',
            issueDate: new Date('2020-11-14'),
        }

        // Act
        const res1 = await request(app.server).post(`${baseUrl}/memberStatus`).send(sayNoNoDto)
        const res2 = await request(app.server).post(`${baseUrl}/memberStatus`).send(geniusBarDto)
        const res3 = await request(app.server).post(`${baseUrl}/memberStatus`).send(workFromHomeDto)

        // Assert
        expect(res1.body['memberStatuses'][0]['kind']).toBe('SayNoNo')
        expect(res2.body['memberStatuses'][1]['kind']).toBe('GeniusBar')
        expect(res3.body['memberStatuses'][2]['kind']).toBe('WorkFromHome')
    })

    it('POST /genius/memberStatus/task append new task when current status is valid', async () => {
        // Arrange
        const geniusDto: PostGeniusDto = { name: 'WQ', joinDate:  new Date('2019-09-02')}
        const geniusRes = await request(app.server).post(baseUrl).send(geniusDto)
        const returnGenius = geniusRes.body

        const memberStatusDto: PostWorkFromHomeDto = {
            genius_Id: returnGenius['_id'],
            kind: 'WorkFromHome',
            issueDate: new Date('2020-11-12')
        }

        const memberStatusRes = await request(app.server).post(`${baseUrl}/memberStatus`).send(memberStatusDto)

        const taskDto: PostAssignedTaskDto = {
            geniusId: returnGenius['_id'],
            taskName: 'Wind Vally',
            issueDate: new Date('2021-12-22')
        }

        // Act
        const res = await request(app.server).post(`${baseUrl}/memberStatus/task`).send(taskDto)

        // Assert
        const fetchBackGenius = res.body
        expect(fetchBackGenius['memberStatuses'][0]['kind']).toBe('WorkFromHome')
        expect(fetchBackGenius['assignedTasks']).toHaveLength(1)
    })

    it('PUT /genius/memberStatus/task make specified tasks released', async () => {
        // Arrange
        const geniusDto: PostGeniusDto = { name: 'Shin Jey', joinDate:  new Date('2019-09-02')}
        const geniusRes = await request(app.server).post(baseUrl).send(geniusDto)
        const returnGenius = geniusRes.body

        const memberStatusDto: PostWorkFromHomeDto = {
            genius_Id: returnGenius['_id'],
            kind: 'WorkFromHome',
            issueDate: new Date('2020-11-12')
        }

        const memberStatusRes = await request(app.server).post(`${baseUrl}/memberStatus`).send(memberStatusDto)

        const taskDto: PostAssignedTaskDto = {
            geniusId: returnGenius['_id'],
            taskName: 'Wind Vally',
            issueDate: new Date('2021-12-22')
        }

        const releaseDto: PutTaskReleaseDto = {
            geniusId: returnGenius['_id'],
            taskName: taskDto.taskName,
            releaseAt: new Date('2021-12-29')
        }

        // Act
        await request(app.server).post(`${baseUrl}/memberStatus/task`).send(taskDto)
        const res = await request(app.server).put(`${baseUrl}/memberStatus/task`).send(releaseDto)

        // Assert
        const fetchBackGenius = res.body
        expect(fetchBackGenius['assignedTasks'][0]['release']).not.toBeUndefined()

    })


    afterEach(async () => {
        await dbHandler.clearDatabase()
    })

    afterAll(async () => {
        await dbHandler.closeDatabase()
        await app.close()
    })
})