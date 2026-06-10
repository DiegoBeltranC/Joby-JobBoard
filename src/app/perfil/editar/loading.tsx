export default function EditarPerfilLoading() {
    return (
        <div className="max-w-2xl mx-auto py-8 px-4 animate-pulse">
            <div className="flex items-center justify-between mb-6">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-9 w-20 bg-gray-100 rounded-full" />
            </div>

            <div className="flex items-center justify-between mb-8 relative">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-200" />
                        <div className="h-3 w-16 bg-gray-100 rounded hidden sm:block" />
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 border-b border-gray-100 pb-2" />

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-5">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-10 bg-white border border-gray-200 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-1/3" />
                            <div className="h-10 bg-white border border-gray-200 rounded-lg" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-24 bg-white border border-gray-200 rounded-lg" />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <div className="h-10 w-48 bg-gray-200 rounded-xl" />
                </div>
            </div>
        </div>
    )
}
