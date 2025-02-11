import CompaniesModel from "../models/CompaniesModel.js"
import UsersModel from "../models/UsersModel.js"

// function to create company
export const createCompany = async (req, res) => {
    try {
        const { user_id, company_name, logo, tax_id } = req.body
        const company = await CompaniesModel.create({ user_id, company_name, logo, tax_id })
        res.status(201).json({ message: "Company created successfully", company })
    } catch (error) {
        res.status(500).json({ message: "Error creating company", error })
    }
}

// function to get company by id
export const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params
        const getCompany = await CompaniesModel.findByPk(id)
        if (getCompany) {
            const company = await CompaniesModel.findAll({
                include: [{
                    model: UsersModel,
                    attributes: ["name", "email", "role"]
                }],
                where: {
                    status: true
                }
            })
            res.status(200).json({ message: "Company retrieved successfully", company })
        }
        else {
            res.status(404).json({ message: "Company not found" })
        }
    } catch (error) {
        res
    }
}

// function to get all companies
export const getCompanies = async (req, res) => {
    try {
        const companies = await CompaniesModel.findAll({
            include: [{
                model: UsersModel,
                attributes: ["name", "email", "role"]
            }]
        })
        res.status(200).json({ message: "Companies retrieved successfully", companies })
    } catch (error) {
        res.status(500).json({ message: "Error retrieving companies", error })
    }
}

// function to update company
export const updateCompany = async (req, res) => {
    try {
        const { id } = req.params
        const { company_name, logo, tax_id } = req.body
        const company = await CompaniesModel.findByPk(id)
        if (company) {
            company.company_name = company_name
            company.logo = logo
            company.tax_id = tax_id
            await company.save()
            res.status(200).json({ message: "Company updated successfully", company })
        }
        else {
            res.status(404).json({ message: "Company not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating company", error })
    }
}

export const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params
        const company = await CompaniesModel.findByPk(id)
        if (company) {
            company.status = false
            await company.save()
            res.status(200).json({ message: "Company deleted successfully", company })
        }
        else {
            res.status(404).json({ message: "Company not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting company", error })
    }
} 

// function to upload image
export const uploadImageCompany = async (req, res) => {
    updateImage(req, res, CompaniesModel)
}