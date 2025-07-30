import CompaniesModel from "../models/CompaniesModel.js";
import UsersModel from "../models/UsersModel.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs/promises";
import sequelize from "../config/connection.js";
import dotenv from "dotenv";
import RolesModel from "../models/RolesModel.js";
import signImage from "../helpers/signImage.js";

dotenv.config()

/**
 * Crear empresa
 *
 * Función que crea un registro de empresa.
 * @param {Object} req - Objeto de la petición HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Empresa creada.
 */
export const AddNewCompany = async (req, res) => {
  try {
    const { user_id, nrc_number, business_type, web_site, nit_number } = req.body;

    // Validar solo si los campos no están vacíos
    if (nrc_number) {
      const existingNrcNumber = await CompaniesModel.findOne({ where: { nrc_number } });
      if (existingNrcNumber) {
        return res.status(400).json({ 
          status: 400,
          message: "Ya existe una empresa con el mismo NRC"
        });
      }
    }

    if (nit_number) {
      const existingNitNumber = await CompaniesModel.findOne({ where: { nit_number } });
      if (existingNitNumber) {
        return res.status(400).json({ 
          status: 400,
          message: "Ya existe una empresa con el mismo NIT"
        });
      }
    }

    const company = await CompaniesModel.create({
      user_id,
      nrc_number: nrc_number || null, // Guarda null si viene vacío
      business_type,
      web_site,
      nit_number: nit_number || null, // Guarda null si viene vacío
    });

    res.status(201).json({
      status: 201,
      message: "Empresa creada con éxito", 
      company 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 500,
      message: "Error al crear la empresa", 
      error: error.message // Mejor práctica: mostrar solo el mensaje de error
    });
  }
};

/**
 * Obtener empresa por ID
 *
 * Función que recupera una empresa según su ID.
 * @param {Object} req - Objeto de la petición HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Empresa encontrada.
 */
export const DetailsCompanyId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Se requiere el ID de la empresa");

    const company = await CompaniesModel.findOne({
      include: [
        {
          model: UsersModel,
          attributes: [
            "id",
            "role_id",
            "name",
            "email",
            "address",
            "phone",
            "image",
          ],
          where: { status: 1 },
          required: true,
          include: [{
            model: RolesModel,
              attributes: ["role_name"],
              as: "role",
              required: true,
          }]
        },
      ],
      where: { id },
    });

    if (company) {
      
      const imageUrl = await signImage(company.user.image)

      const companyWithImage = {
        ...company.dataValues,
        user: {
          ...company.user.dataValues,
          image: imageUrl
        }
      }

      res
        .status(200)
        .json({ 
          status: 200,
          message: "Empresa obtenida con éxito", 
          company: companyWithImage 
        });
    } else {
      res
        .status(404)
        .json({ 
          status: 404,
          message: "Empresa no encontrada" 
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al obtener la empresa", 
        error: error.message 
      });
  }
};

/**
 * Obtener empresa por user_id
 *
 * Función que recupera una empresa según su user_id.
 * @param {Object} req - Objeto de la petición HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Empresa encontrada.
 */
export const DetailsCompanyIdUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) throw new Error("Se requiere el id del usuario");

    const company = await CompaniesModel.findOne({
      include: [
        {
          model: UsersModel, as: 'user',
          attributes: [
            "id",
            "role_id",
            "name",
            "email",
            "address",
            "phone",
            "image",
            "account_type"
          ],
          where: { status: 1 },
          required: true,
          include: [{
            model: RolesModel,
              attributes: ["role_name"],
              as: "role",
              required: true,
          }]
        },
      ],
      where: { user_id: user_id },
    });

    if (company) {
      
      const imageUrl = await signImage(company.user.image)

      const companyWithImage = {
        ...company.dataValues,
        user: {
          ...company.user.dataValues,
          image: imageUrl
        }
      }

      res
        .status(200)
        .json({ 
          status: 200,
          message: "Empresa obtenida con éxito", 
          company: companyWithImage 
        });
    } else {
      res
        .status(404)
        .json({ 
          status: 404,
          message: "Empresa no encontrada" 
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al obtener la empresa", error 
      });
  }
};

/**
 * Listar todas las empresas
 *
 * Función que recupera todas las empresas.
 * @param {Object} req - Objeto de la petición HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object[]} Lista de empresas.
 */
export const ListAllCompany = async (req, res) => {
  try {
    const companies = await CompaniesModel.findAll({
      include: [
        {
          model: UsersModel,
          as: 'user',
          attributes: [
            "id",
            "role_id",
            "name",
            "email",
            "address",
            "phone",
            "image",
          ],
          where: { status: 1 },
          required: true,
          include: [{
            model: RolesModel,
              attributes: ["role_name"],
              as: "role",
              required: true,
          }]
        },
      ],
    });

    if (companies) {
      const companiesWithImage = await Promise.all(
        companies.map(async (company) => {
          
          const imageUrl = await signImage(company.user.image)

          return {
            ...company.dataValues,
            user: {
              ...company.user.dataValues,
              image: imageUrl
            }
          }
        })
      )
        res
        .status(200)
        .json({ 
          status: 200,
          message: "Empresas obtenidas con éxito", 
          companies: companiesWithImage 
      });
    }
    else { 
      res.
        status(404).
        json({ 
          status: 404,
          message: "No se encontraron empresas" 
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al obtener las empresas", 
        error: error.message 
      });
  }
};

/**
 * Actualizar empresa
 *
 * Función que actualiza una empresa por su ID.
 * @param {Object} req - Objeto de la petición HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Empresa actualizada.
 */
export const UpdateCompanyId = async (req, res) => {
  try {
    const { id } = req.params;
    const { nrc_number, business_type, web_site, nit_number } = req.body;

    const company = await CompaniesModel.findByPk(id);
    if (!company) {
      res
        .status(404)
        .json({ 
          status: 404,
          message: "Empresa no encontrada" 
        });
    }

    const existingNrcNumber = await CompaniesModel.findOne({
      where: { nrc_number },
      id: { [Op.ne]: id },
    });

    const existingNitNumber = await CompaniesModel.findOne({
      where: { nit_number },
      id: { [Op.ne]: id },
    });

    if (!existingNrcNumber) company.nrc_number = nrc_number;
    if (!existingNitNumber) company.nit_number = nit_number;

    company.business_type = business_type;
    company.web_site = web_site;
    await company.save();

    res
      .status(200)
      .json({ 
        status: 200,
        message: "Empresa actualizada con éxito", company 
      });
  } catch (error) {
    res
      .status(500)
      .json({ 
        status: 500,
        message: "Error al actualizar la empresa", error 
      });
  }
};

/**
 * Actualizar perfil de la empresa
 *
 * Función que actualiza el perfil de la empresa, incluyendo
 * información de contacto y el logo.
 * @param {Object} req - Objeto de la petición HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP.
 * @returns {Object} Perfil de empresa actualizado.
 */

const clean = (v) => (v ?? "").trim().toUpperCase();
const deleteFileSafe = async (file) => {
  if (!file) return;
  try {
    await fs.unlink(path.join("src/images", file));
  } catch {
  }
};

export const UpdateCompanyProfile = async (req, res) => {
  const t = await sequelize.transaction();
  let oldImage = null;

  try {
    const { id } = req.params;
    const {
      name,
      nrc_number = "",
      nit_number = "",
      business_type,
      web_site,
      contact_email,
    } = req.body;

    const nrc = clean(nrc_number);
    const nit = clean(nit_number);

    const company = await CompaniesModel.findByPk(id, { transaction: t });
    if (!company) throw new Error("Empresa no encontrada");

    const user = await UsersModel.findByPk(company.user_id, { transaction: t });
    if (!user) throw new Error("Usuario asociado no encontrado");

    if (
      (nrc && nrc !== clean(company.nrc_number)) ||
      (nit && nit !== clean(company.nit_number))
    ) {
      const dup = await CompaniesModel.findOne({
        where: {
          [Op.or]: [{ nrc_number: nrc }, { nit_number: nit }],
          id: { [Op.ne]: id },
        },
        transaction: t,
      });
      if (dup) throw new Error("NRC o NIT ya existen");
    }

    Object.assign(company, {
      ...(nrc && { nrc_number: nrc }),
      ...(nit && { nit_number: nit }),
      ...(business_type && { business_type }),
      ...(web_site && { web_site }),
    });

    Object.assign(user, {
      ...(name && { name }),
      ...(contact_email && { email: contact_email }),
    });

    if (req.file) {
      oldImage = user.image;
      user.image = req.file.filename;
    }

    await company.save({ transaction: t });
    await user.save({ transaction: t });
    await t.commit();

    if (oldImage) deleteFileSafe(oldImage);

    const updated = await CompaniesModel.findByPk(id, {
      include: [
        {
          model: UsersModel,
          attributes: ["role_id", "name", "email", "address", "phone", "image"],
          where: { status: 1 },
        },
      ],
    });

    return res.status(200).json({
      message: "Perfil actualizado con éxito",
      company: updated,
    });
  } catch (err) {
    await t.rollback();
    if (req.file) deleteFileSafe(req.file.filename);
    return res.status(422).json({ message: err.message });
  }
};
