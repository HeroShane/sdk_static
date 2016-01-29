(function(){
  try{
    if(!Swiper) return;
    console.info("swiper init .....")
    var _initSwiper = function() {
      new Swiper('.swiper-container', {
          nextButton: '.swiper-button-next',
          prevButton: '.swiper-button-prev',
          pagination: '.swiper-pagination',
          paginationClickable: true,
          // Disable preloading of all images
          preloadImages: false,
          // Enable lazy loading
          lazyLoading: true
      }); 
    }
    _initSwiper()
  }catch(error){
    console.error("swiper init error: ", error)
  }
})()
