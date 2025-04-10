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
    const { user_id, nrc_number, bussiness_type, web_site, nit_number } = req.body;
    const company = await CompaniesModel.create({
      user_id,
      nrc_number,
      bussiness_type,
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
    const getCompany = await CompaniesModel.findByPk(id);
    if (getCompany) {
      const company = await CompaniesModel.findAll({
        include: [
          {
            model: UsersModel,
            attributes: ["name", "email", "role"],
            where: {
              status: true,
            },
          },
        ],
        where: {
          id: id
        }
      });
      res
        .status(200)
        .json({ message: "Company retrieved successfully", company });
    } else {
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
      include: [
        {
          model: UsersModel,
          attributes: ["name", "email", "role"],
          where: {
            status: true,
          },
        },
      ],
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
    const { company_name, logo, tax_id } = req.body;
    const company = await CompaniesModel.findByPk(id);
    if (company) {
      company.company_name = company_name;
      company.logo = logo;
      company.tax_id = tax_id;
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

/**
 * delte company
 *
 * function to delete company
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} company deleted
 */
export const DeleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await CompaniesModel.findByPk(id);
    if (company) {
      company.status = false;
      await company.save();
      res
        .status(200)
        .json({ message: "Company deleted successfully", company });
    } else {
      res.status(404).json({ message: "Company not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting company", error });
  }
};

/**
 * upload image
 *
 * function to upload image
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} image uploaded
 */
export const UploadLogoCompany = async (req, res) => {
  updateImage(req, res, CompaniesModel);
};

