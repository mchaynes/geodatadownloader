import { ActionFunctionArgs, Form, Link, Navigate, useActionData } from "react-router-dom";
import { supabase } from "../supabase";
import logo from "/IMG_1039.png";


export const signInAction = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData();
  const email = data.get('email') as string
  const password = data.get('password') as string
  return await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
}

export default function SignIn() {
  const signInData = useActionData() as Awaited<ReturnType<typeof signInAction>>
  if (signInData?.data && !signInData?.error) {
    return <Navigate to="/" />
  }
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900">
      <Link to="/" className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white">
        <img src={logo as string} className="mr-4 h-14" alt="Geodatadownloader Logo" />
      </Link>
      <div className="w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
        {signInData?.error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <span className="font-medium">{signInData.error.message}</span>
          </div>

        )}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sign in
        </h2>
        <Form className="mt-8 space-y-6" method="post">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
            <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="name@company.com" required />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
            <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required />
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input id="remember" aria-describedby="remember" name="remember" type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="remember" className="font-medium text-gray-900 dark:text-white">Remember me</label>
            </div>
            <Link to="/forgot" className="ml-auto text-sm text-primary-700 hover:underline dark:text-primary-500">Lost Password?</Link>
          </div>
          <button type="submit" className="w-full px-5 py-3 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Not registered? <Link to="/signup" className="text-primary-700 hover:underline dark:text-primary-500">Create account</Link>
          </div>
        </Form>

      </div>
    </div>
  )
}
