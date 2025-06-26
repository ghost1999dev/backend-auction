import UsersModel from "../models/UsersModel.js";
import CompaniesModel from "../models/CompaniesModel.js";
import ProjectsModel from "../models/ProjectsModel.js";
import DevelopersModel from "../models/DevelopersModel.js";
import { Op } from 'sequelize'

export const countActiveCompanies = async (req, res) => {
  try {
    const companiesCount = await UsersModel.count({
      where: { status: 1 },
      include: [{
        model: CompaniesModel,
        as: 'company_profile',
        required: true
      }]
    })
    return res.status(200).json({
      companiesCount,
      message: 'Conteo de empresas activas exitosamente',
      status: 200
    })
  } catch (error) {
    console.error('Error en conteo:', error)
    return res.status(500).json({ error: 'Error al obtener conteos' })
  }
}

export const countActiveDevelopers = async (req, res) => {
  try {
    const developersCount = await UsersModel.count({
      where: { status: 1 },
      include: [{
        model: DevelopersModel,
        as: 'dev_profile',
        required: true
      }]
    })
    return res.status(200).json({
      developersCount,
      message: 'Conteo de developers activos exitosamente',
      status: 200
    })
  } catch (error) {
    console.error('Error en conteo:', error)
    return res.status(500).json({ error: 'Error al obtener conteos' })
  }
}
