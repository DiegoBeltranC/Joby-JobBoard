export default function RevisionEmpresaLoading() {
    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto font-sans animate-pulse">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-200 border border-gray-100" />
                        <div className="space-y-2">
                            <div className="h-7 bg-gray-200 rounded w-64" />
                            <div className="h-4 bg-gray-100 rounded w-40" />
                        </div>
                    </div>
                </div>
                <div className="h-10 w-32 bg-gray-100 rounded-2xl border border-gray-200" />
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div className="bg-white p-2 flex items-center gap-2 rounded-2xl border border-gray-100 shadow-sm">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 h-12 bg-gray-50 rounded-xl" />
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px] space-y-6">
                        <div className="h-6 bg-gray-200 rounded w-1/3 border-b border-gray-100 pb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                                </div>
                                <div>
                                    <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
                                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                                <div className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-40" />
                            <div className="h-3 bg-gray-100 rounded w-56" />
                        </div>
                        <div className="flex gap-3">
                            <div className="h-12 w-32 bg-gray-100 rounded-xl" />
                            <div className="h-12 w-32 bg-gray-200 rounded-xl" />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-96 shrink-0">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-[calc(100vh-120px)] space-y-4">
                        <div className="h-5 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="space-y-3 mt-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-gray-50 rounded-2xl border border-gray-100" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
