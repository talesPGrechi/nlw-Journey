import nodemailer from 'nodemailer';
import dayjs from 'dayjs';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../prisma";
import { getMailClient } from '../mail';


export async function confirmParticipant(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId/confirm',{
        schema:{
            params: z.object({
                participantId: z.string().uuid(),
            })
        }
    },async (request, reply) => {
        
        const {participantId} = request.params
        
        const participant = await prisma.participant.findUnique({
            where:{
                id: participantId
            }
        })
        
        
        if(!participant){
            throw new Error("Participant not Found.")
        }
        
        if(participant.is_confirmed){
            return reply.redirect(`http://localhost:3333/trips/${participant.trip_id}`)
        }

        await prisma.participant.update({
            where: {id: participantId},
            data: {is_confirmed: true}
        })
        
        return reply.redirect(`http://localhost:3333/trips/${participant.trip_id}`)
    })
}