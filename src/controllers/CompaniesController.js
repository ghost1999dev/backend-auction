import CompaniesModel from "../models/CompaniesModel.js";
import UsersModel from "../models/UsersModel.js";

/**
 * create company
 *
 * function to create company
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} company created
 */
export const AddNewCompany = async (req, res) => {
  try {
    const { user_id, nrc_number, business_type, web_site, nit_number } = req.body;
    
    const existingNrcNumber = await CompaniesModel.findOne({ where: { nrc_number } })
    const existingNitNumber = await CompaniesModel.findOne({ where: { nit_number } })

    if (existingNrcNumber || existingNitNumber) {
      return res.status(400).json({ message: "nrc number or nit number already exists" });
    }
    
    const company = await CompaniesModel.create({
      user_id,
      nrc_number,
      business_type,
      web_site,
      nit_number,
    });

    res.status(201).json({ message: "Company created successfully", company });
  
  } catch (error) {
    res.status(500).json({ message: "Error creating company", error });
  }
};

/**
 * get company by id
 *
 * function to get company by id
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} company retrieved
 */
export const DetailsCompanyId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) throw new Error("Company id is required");

    const company = await CompaniesModel.findOne({
      include: [{
        model: UsersModel,
        attributes: [
          "role_id",
          "name", 
          "email", 
          "address", 
          "phone", 
          "image", 
        ],
        where: {
          status: 1,
        },
        required: true
      }],
      where: {
        id: id
      }
    })

    if (company) {
      res.status(200).json({ message: "Company retrieved successfully", company });
    }
    else {
      res.status(404).json({ message: "Company not found" });
    }
    
  } catch (error) {
    res.status(500).json({ message: "Error retrieving company", error });
  }
};

/**
 * get all companies
 *
 * function to get all companies
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} companies retrieved
 */
export const ListAllCompany = async (req, res) => {
  try {
    const companies = await CompaniesModel.findAll({
      include: [{
        model: UsersModel,
        attributes: [
          "role_id",
          "name", 
          "email", 
          "address", 
          "phone", 
          "image", 
        ],
        where: {
          status: 1,
        },
        required: true
      }],
    });
    res
      .status(200)
      .json({ message: "Companies retrieved successfully", companies });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving companies", error });
  }
};

/**
 * update company
 *
 * function to update company
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} company updated
 */
export const UpdateCompanyId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nrc_number, business_type, web_site, nit_number } = req.body;
    const company = await CompaniesModel.findByPk(id);
    if (company) {

      const existingNrcNumber = await CompaniesModel.findOne({ 
        where: { 
          nrc_number 
        },
        id: {
          [Op.ne]: id
        } 
      })
      const existingNitNumber = await CompaniesModel.findOne({ 
        where: { 
          nit_number 
        },
        id: {
          [Op.ne]: id
        }
      })

      if (existingNrcNumber || existingNitNumber) {
        return res.status(400).json({ message: "nrc number or nit number already exists" });
      }
      
      company.nrc_number = nrc_number;
      company.business_type = business_type;
      company.web_site = web_site;
      company.nit_number = nit_number;
      await company.save();

      res
        .status(200)
        .json({ message: "Company updated successfully", company });
    } else {
      res.status(404).json({ message: "Company not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating company", error });
  }
};