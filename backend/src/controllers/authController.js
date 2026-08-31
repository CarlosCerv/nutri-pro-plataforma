import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, specialty, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email',
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        specialty,
        phone,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialty: user.specialty,
            },
            token,
        },
    });
}, { message: 'Error registering user' });

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password',
        });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialty: user.specialty,
                phone: user.phone,
            },
            token,
        },
    });
}, { message: 'Error logging in' });

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.specialty = req.body.specialty || user.specialty;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
        user.password = req.body.password;
    }

    if (req.body.username) {
        user.username = req.body.username;
    }

    // Los arreglos (`services`, `workingHours`) se reemplazan enteros cuando
    // vienen en el body — la pantalla de "Página pública" siempre manda su
    // estado completo, nunca un parche de un solo elemento.
    if (req.body.publicBooking) {
        const pb = req.body.publicBooking;
        if (pb.enabled !== undefined) user.publicBooking.enabled = pb.enabled;
        if (pb.bio !== undefined) user.publicBooking.bio = pb.bio;
        if (pb.slotDurationMinutes !== undefined) user.publicBooking.slotDurationMinutes = pb.slotDurationMinutes;
        if (pb.services !== undefined) user.publicBooking.services = pb.services;
        if (pb.workingHours !== undefined) user.publicBooking.workingHours = pb.workingHours;
    }

    let updatedUser;
    try {
        updatedUser = await user.save();
    } catch (error) {
        // Índice único de `username`: mensaje claro en vez del 500 genérico
        // que dejaría pasar el error de Mongo tal cual.
        if (error.code === 11000 && error.keyPattern?.username) {
            return res.status(409).json({
                success: false,
                message: 'Ese nombre de usuario ya está en uso.',
            });
        }
        throw error;
    }

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                specialty: updatedUser.specialty,
                phone: updatedUser.phone,
                username: updatedUser.username,
                publicBooking: updatedUser.publicBooking,
            },
        },
    });
}, { message: 'Error updating profile' });

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialty: user.specialty,
                phone: user.phone,
                username: user.username,
                publicBooking: user.publicBooking,
            },
        },
    });
}, { message: 'Error fetching user data' });
