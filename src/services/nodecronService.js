import cron from 'node-cron'
import { Op } from 'sequelize'
import CompaniesModel from '../models/CompaniesModel.js'
import ProjectsModel from '../models/ProjectsModel.js'
import UsersModel from '../models/UsersModel.js'
import NotificationsModel from '../models/NotificationsModel.js'
import sequelize from '../config/connection'

import { sendBlockedUserEmail } from './emailService.js'

cron.schedule('0 0 * * *', async () => {
    try {
        const finishedProjects = await ProjectsModel.findAll({
            where: { 
                status: 4,
                [Op.and]: [
                    sequelize.where(
                        sequelize.fn('AGE', sequelize.col('updatedAt')),
                        { [Op.gte]: sequelize.literal("INTERVAL '5 days'") }
                    )
                ]
            },
            include: [{ 
                model: CompaniesModel, 
                as: 'company',
                include: [{
                    model: UsersModel,
                    attributes: [{
                        exclude: ['password']
                    }]
                }] 
            }]
        });


        for (const project of finishedProjects) {
            if (!project.company?.user) continue

            if (project.company.user.status === 5) continue

            try {
                await UsersModel.update({ 
                        status: 5 
                    },
                    {
                        where: {
                        id: project.company.user.id
                    }
                })

                await NotificationsModel.create({
                    user_id: project.company.user_id,
                    title: 'Usuario bloqueado',
                    body: `El usuario ${project.company.user.name} ha sido bloqueado porque no ha programado la subasta en el tiempo disponible.`,
                    context: JSON.stringify({
                        action: 'user_auto_block',
                        user_id: project.company.user_id,
                        status: 'bloqueado'
                    }),
                    sent_at: new Date(),
                    status: 'Enviado',
                    error_message: null
                })

                await sendBlockedUserEmail({
                    email: project.company.email,
                    name: project.company.name,
                    project_name: project.project_name
                })
            } catch (error) {
                
            }
        }
    } catch (error) {
        console.error({
            message: 'Error en la verificación diaria de proyectos:',
            error: error.message
        })
    }
})