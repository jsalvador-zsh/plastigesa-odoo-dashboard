import { SignIn } from '@clerk/nextjs';

export default function Page() {
    return (
        <div className=" grid grid-cols-2 items-center justify-center">
            <div className='min-h-screen bg-gray-100 hidden md:block'>
            </div>
            <div className='flex justify-center items-center'>
                <SignIn />
            </div>
        </div>
    )
}
