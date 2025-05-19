const token = localStorage.getItem('token');
const BASE_URL = 'https://rakunko.store/api/car';
const getBaseUrlPath = (isSale = false) =>{
    return isSale ? `${BASE_URL}/sale/search/filters` : `${BASE_URL}/search/filters`;
}
export const fetchCar = async (page, size, setResponse, setError, setLoading,
    priceRange,
    mileageRange,
    selectedColors,
    setCurrentPage, setTotalPages, isSale) => {
    let url = `${getBaseUrlPath(isSale)}/model?page=${page}&size=${size}`;

    // 가격 범위가 존재하면 쿼리 파라미터에 추가
    if (priceRange && priceRange.length === 2) {
        url += `&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`;
    }

    // 주행 거리 범위가 존재하면 쿼리 파라미터에 추가
    if (mileageRange && mileageRange.length === 2) {
        url += `&minMileage=${mileageRange[0]}&maxMileage=${mileageRange[1]}`;
    }

    // 선택된 색상이 존재하면 쿼리 파라미터에 추가
    if (Array.isArray(selectedColors) && selectedColors.length > 0) {
        selectedColors.forEach(color => {
            url += `&color=${color}`;
        });
    }

 

    try {
        setLoading(true);
        setResponse({ data: [] });
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (!res.ok) {
            throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
        }
        const data = await res.json();
        if (setTotalPages != null) {
            setTotalPages(data.result.totalPages)
        }
        console.log(data.result);
        setResponse(data.result);
    } catch (err) {
        if (err.name === 'AbortError') {
           
            setError('서버 연결 시간이 초과되었습니다. ');
        } else {
            setError(err.message);
        }
    } finally {
        setLoading(false);
    }
};



export const fetchCarByInfo = async (
    page,
    size,
    filters,
    setResponse,
    setError,
    setLoading,
    setTotalPages,
    isSale
  ) => {
    try {
      setLoading(true);
      setResponse({ data: [] });
      const params = {
        page,
        size,
        minAge: filters.year.min || undefined,
        maxAge: filters.year.max || undefined,
        minMileage: filters.mileage.min || undefined,
        maxMileage: filters.mileage.max || undefined,
        minPrice: filters.price.min || undefined,
        maxPrice: filters.price.max || undefined,
        color: filters.color.min || undefined
      };
      console.log(params);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
      console.log(queryString);
      const url = `${getBaseUrlPath(isSale)}/info?${queryString}`;
  
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
  
      if (!res.ok) {
        throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await res.json();
      console.log(res);
      setResponse(data.result);
      if (setTotalPages) {
        setTotalPages(data.result.totalPages);
      }
  
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('서버 연결 시간이 초과되었습니다.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  export const fetchCarByModel = async (
    page,
    size,
    selectedModel,
    setResponse,
    setError,
    setLoading,
    setTotalPages,
    isSale
  ) => {
    try {
      setLoading(true);
      setResponse({ data: [] });
      const params = {
        page,
        size,
        manu: selectedModel.manufacturer?.name || undefined,
        model: selectedModel.model?.name || undefined,
        submodel: selectedModel.subModel?.name || undefined,
        grade: selectedModel.grade?.name || undefined
      };
      console.log(params);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
  
      const url = `${getBaseUrlPath(isSale)}/model?${queryString}`;
  
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        signal: controller.signal
      });
  
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
      }
  
      const data = await res.json();
      console.log(data.result);
      setResponse(data.result);
      if (setTotalPages) {
        setTotalPages(data.result.totalPages);
      }
  
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('서버 연결 시간이 초과되었습니다.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  export const fetchCarByTag = async (
    page,
    size,
    setResponse,
    setError,
    setLoading,
    setTotalPages,
    isSale,
    tag
  ) => {
    try {
      setLoading(true);
      setResponse({ content: [] });
      const params = {
        page,
        size,
        tag
      };
      console.log(params);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const url = `${getBaseUrlPath(true)}/tags?${queryString}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
      }

      const data = await res.json();
      console.log('태그 검색 결과:', data.result);
      //setResponse(data.result);
      // 응답 데이터 구조 맞추기
      setResponse({
        content: data.result,  // 배열을 content 필드에 넣기
        totalPages: Math.ceil(data.result.length / size)  // 총 페이지 계산
      });
      // if (setTotalPages) {
      //   setTotalPages(data.result.totalPages);
      // }
      if (setTotalPages) {
        setTotalPages(Math.ceil(data.result.length / size));
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('서버 연결 시간이 초과되었습니다.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }
