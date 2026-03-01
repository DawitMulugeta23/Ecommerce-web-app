import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    profilePicture: {
      type: String,
      default: function () {
        // Use a default avatar if email is not available
        const email = this.email || "user@example.com";
        return `https://www.gravatar.com/avatar/${Buffer.from(email).toString("hex")}?d=identicon`;
      },
    },
  },
  { timestamps: true },
);

// 1. የ 'next' ስህተትን ለመፍታት በቀጥታ async function ተጠቀም
userSchema.pre("save", async function () {
  // ፓስወርዱ ካልተቀየረ ስራውን አቁም
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // እዚህ ጋር next() መጥራት አያስፈልግም፣ async function ራሱ ስራውን እንደጨረሰ ያውቃል
  } catch (error) {
    throw new Error(error);
  }
});

// 2. ለሎጊን ጊዜ ፓስወርድ ለማነጻጸር የሚረዳ ተግባር (Helper Method)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
