import mongoose from "mongoose";
import validator from "validator";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../common/enums/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
      minLength: [2, "first name must be greater than 1 and less than 25"],
      maxLength: [25, "first name must be greater than 1 and less than 25"],
      validate: [
        {
          validator: function (value) {
            return value.trim().length > 0;
          },
          message: "first name can't be empty",
        },
        {
          validator: function (value) {
            return isNaN(+value);
          },
          message: "first name must contain characters",
        },
      ],
    },
    lastName: {
      type: String,
      // required: [true, "last name is required"],
      minLength: [2, "last name must be greater than 1 and less than 25"],
      maxLength: [25, "last name must be greater than 1 and less than 25"],
      validate: [
        {
          validator: function (value) {
            return value.trim().length > 0;
          },
          message: "last name can't be empty",
        },
        {
          validator: function (value) {
            return isNaN(+value);
          },
          message: "last name must contain characters",
        },
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "please enter a valid email format",
      },
    },
    password: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.System;
      },
      minLength: [8, "password must be greater than 8 and less than 100"],
      maxLength: [100, "password must be greater than 8 and less than 100"],
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    phone: {
      type: String,
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.User,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System,
    },
    confirmEmail: Date,
    profilePicture: String,
    coverPicture: String,
    changeCredentialsTime: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//username
userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
