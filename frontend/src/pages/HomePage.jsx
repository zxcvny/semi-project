import Header from '../components/layout/Header'
// import ProductList from '../features/products/components/ProductList'

const categories = [
    '디지털기기', '컴퓨터', '카메라', '가구/인테리어',
    '자전거', '패션/잡화', '오디오', '시계/주얼리'
]

const HomePage = () => {
    return(
        <>
            <Header />
            <main>
                <div>
                    <nav>
                        {categories.map((cat, index) => (
                            <div key={index}>
                                <div>📷</div>
                                <span>{cat}</span>
                            </div>
                        ))}
                    </nav>
                    {/* <ProductList /> */}
                </div>
            </main>
        </>
    )
}

export default HomePage;