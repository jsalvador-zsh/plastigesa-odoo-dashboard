import { SignIn } from '@clerk/nextjs';

export default function Page() {
    return (
        <div className="md:grid md:grid-cols-2 items-center justify-center">
            <div className='bg-gray-100 hidden md:flex flex-col justify-center items-center h-full px-8'>
                <div className="flex flex-col justify-center items-center h-full px-8">
                    <img
                        src="/plastigesa.png"
                        alt="Plastigesa Logo"
                        className="h-32 mb-6"
                    />
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">Bienvenido a Plastigesa</h1>
                    <p className="text-lg text-gray-600 text-center">
                        Accede a tu panel de control para gestionar tus proyectos y recursos de manera eficiente.
                    </p>
                </div>
            </div>
            <div className='min-h-screen flex justify-center items-center'>
                <SignIn />
            </div>
        </div>
    )
}
