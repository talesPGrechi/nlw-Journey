import nodemailer from 'nodemailer';
import dayjs from 'dayjs';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../prisma";
import { getMailClient } from '../mail';


export async function confirmTrip(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:trip_id/confirm',{
        schema:{
            params: z.object({
                trip_id: z.string().uuid()
            })
        }
    },async (request, reply) => {
        
        const {trip_id} = request.params

        const trip = await prisma.trip.findUnique({
            where: {
                id: trip_id
            },
            include: {
                participants: {
                    where: {
                        is_owner: false
                    }
                }
            }
        })
        
        if(!trip){
            throw new Error("Trip not Found.")
        }
        
        if(trip.is_confirmed){
            return reply.redirect(`http://localhost:3333/trips/${trip_id}`)
        }

        await prisma.trip.update({
            where: {id: trip_id},
            data: {is_confirmed: true}
        })

        const formattedStartDate = dayjs(trip.starts_at).format("DD/MM/YYYY")
        const formattedEndDate = dayjs(trip.ends_at).format("DD/MM/YYYY")

        

        const mail = await getMailClient()

        await Promise.all(trip.participants.map(async (participant)=>{
            const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`

            const message = await mail.sendMail({
                from: {
                    name: 'Equipe plann.er',
                    address: 'oi@plann.er'
                },
                to: participant.email,
                subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartDate}`,
                html: `
                
                    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                        <p>Você foi convidade para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartDate} a ${formattedEndDate}</strong>.</p> 
                        <p></p>
                        <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
                        <p></p>
                        <p><a href="${confirmationLink}">Confirmar viagem</a></p>
                        <p></p>
                        <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p> 
                    </div>
                `.trim()
            })

            console.log(nodemailer.getTestMessageUrl(message));
        } ))
        
        return reply.redirect(`http://localhost:3333/trips/${trip_id}`)
    })
}