export default function LoginPage() {
    return (
        <section className="min-h-[60vh] flex items-center justify-center">
            <form className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-2xl font-semibold text-center">Login</p>

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>

                <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white">
                    Login
                </button>
            </form>
        </section>
    );
}
