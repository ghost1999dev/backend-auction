import Joi from 'joi'

export const createProjectSchema = Joi.object({
    company_id: Joi.number().required(),
    category_id: Joi.number().required(),
    project_name: Joi.string().min(5).required()
        .messages({
            'string.min': 'El nombre del proyecto debe tener al menos 5 caracteres'
        }),
    description: Joi.string().min(20).required()
        .messages({
            'string.min': 'La descripción del proyecto debe tener al menos 20 caracteres'
        }),
    long_description: Joi.string().min(100).required()
        .messages({
            'string.min': 'La descripción larga del proyecto debe tener al menos 100 caracteres'
        }),
    budget: Joi.number().min(100).required()
        .messages({
            'number.min': 'El presupuesto del proyecto debe ser mayor o igual a 100',
            'number.base': 'El presupuesto del proyecto debe ser numérico',
            'any.required': 'El presupuesto del proyecto es obligatorio'
        }),
    days_available: Joi.number().min(2).required()
        .messages({
            'number.min': 'El número de días disponibles debe ser mayor o igual a 2',
            'number.base': 'El número de días disponibles debe ser numérico',
            'any.required': 'El número de días disponibles es obligatorio'
        })
})

export const updateProjectSchema = Joi.object({
    company_id: Joi.number().required(),
    category_id: Joi.number().required(),
    project_name: Joi.string().min(5).required()
        .messages({
            'string.min': 'El nombre del proyecto debe tener al menos 5 caracteres'
        }),
    description: Joi.string().min(20).required()
        .messages({
            'string.min': 'La descripción del proyecto debe tener al menos 20 caracteres'
        }),
    budget: Joi.number().min(100).required()
        .messages({
            'number.min': 'El presupuesto del proyecto debe ser mayor o igual a 100',
            'number.base': 'El presupuesto del proyecto debe ser numérico',
            'any.required': 'El presupuesto del proyecto es obligatorio'
        }),
    days_available: Joi.number().min(2).required()
        .messages({
            'number.min': 'El número de días disponibles debe ser mayor o igual a 2',
            'number.base': 'El número de días disponibles debe ser numérico',
            'any.required': 'El número de días disponibles es obligatorio'
        })
})