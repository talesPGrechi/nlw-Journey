import fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./lib/prisma";
import { createTrip } from "./lib/routes/create-trip";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import { confirmTrip } from "./lib/routes/confirm-trip";
import { confirmParticipant } from "./lib/routes/confirm-participant";
import { createActivity } from "./lib/routes/create-activity";
import { getActivities } from "./lib/routes/get-activities";
import { createLink } from "./lib/routes/create-link";
import { getLinks } from "./lib/routes/get-links";
import { getParticipants } from "./lib/routes/get-participants";
import { createInvite } from "./lib/routes/create-invite";
import { updateTrip } from "./lib/routes/update-trip";
import { getTripDetails } from "./lib/routes/get-trip-details";
import { getParticipant } from "./lib/routes/get-participant";


const app = fastify()

app.register(cors,{
    origin: '*'
})


app.get('/cadastrar', async () => {
    await prisma.trip.create({
        data: {
            destination: "florianopolis",
            starts_at: new Date(),
            ends_at: new Date()
        }
    })

    return "Registro cadastrado com sucesso!"
})

app.get('/listar', async ()=> {
    const trips = prisma.trip.findMany()

    return trips;
})


app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)
app.register(confirmTrip)
app.register(confirmParticipant)
app.register(createActivity)
app.register(getActivities)
app.register(createLink)
app.register(getLinks)
app.register(getParticipants)
app.register(createInvite)
app.register(updateTrip)
app.register(getTripDetails)
console.log('aaa');
app.register(getParticipant)

console.log('bbb');
app.listen({port:3333}).then(()=>{
    console.log('server running!')
    
})
