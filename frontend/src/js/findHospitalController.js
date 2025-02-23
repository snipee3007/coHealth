class FindHospital{
    init() {
        this.#popup();
    }
    #popup(){
        const detailBtn = document.querySelector(".details");
        detailBtn.addEventListener("click",function(){
            document.querySelector(".popup").classList.remove('hidden');
            document.querySelector(".containerScreen").classList.add('opacity-10');
            const btns = document.querySelector(".containerScreen").querySelectorAll(".butt");
            for (const btn of btns){
                btn.disabled = true;
            }
        })
        
    }
}

export default  FindHospital;

