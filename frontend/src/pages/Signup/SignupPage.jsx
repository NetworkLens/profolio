import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validatePassword } from "../../utils/password";
import { signup } from "../../services/authentication";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import "../../App.css";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export function SignupPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords Do Not Match");
      }
      validatePassword(password);
      setSubmitting(true);
      await signup(firstname, lastname, email, password);
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
      navigate("/signup");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFirstNameChange(event) {
    setFirstname(event.target.value);
  }

  function handleLastNameChange(event) {
    setLastname(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }
  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
  }

  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center bg-[#0A2243]">
        <div className="max-w-3xl w-full relative">
          <div className="absolute -left-2 -top-2 w-full h-full border rounded-xl bg-[#AEE938] -z-10"></div>

          <Card style={{ boxShadow: "#FFD300 10px 10px" }}>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your information below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                    <Input
                      placeholder="Enter Your Firstname"
                      id="firstname"
                      type="text"
                      value={firstname}
                      onChange={handleFirstNameChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                    <Input
                      placeholder="Enter Your Lastname"
                      id="lastname"
                      type="text"
                      value={lastname}
                      onChange={handleLastNameChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      placeholder="Enter Your Email"
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      placeholder="Enter Your Password"
                      id="password"
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      minLength={8}
                      maxLength={16}
                      required
                    />
                    {/* <FieldDescription className="grid">
                    <p>Minimum 8 characters, maximum 16 characters.</p>
                    <p>At least 1 capital letter.</p>
                    <p>At least 1 number.</p>
                    <p>At least 1 special character.</p>
                  </FieldDescription> */}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      placeholder="Enter Your Confirm Password"
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                    />
                    <FieldDescription>
                      Please confirm your password.
                    </FieldDescription>
                  </Field>
                  <FieldGroup>
                    <Field>
                      <Button
                        role="submit-button"
                        id="submit"
                        type="submit"
                        value="Submit"
                        className="bg-[#FFD300] text-[#0A2243] hover:bg-[#0A2243] hover:text-[#FFD300]"
                        disabled={submitting}
                      >
                        {submitting ? <Spinner /> : "Create Account"}
                      </Button>
                      <FieldDescription className="px-6 text-center">
                        Already have an account?{" "}
                        <Button
                          variant={"link"}
                          onClick={() => navigate("/login")}
                        >
                          Log in
                        </Button>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
