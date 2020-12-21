let socket = io();

let onBiddingProduct = (productId) => {

    if (!socket.connected) {
        //not connected
        onBiddingFail('You must login before bidding. Are you have an account <a href="/login">Login<a/>? or '+
        'Create new <a href="/user/register">Here<a/>!');
        return;
    }

    let price = document.getElementById(productId).textContent;
    let newPrice = document.getElementById('input-price' + productId);

    if (window.location.pathname === '/products/' + productId) {

        if (parseInt(price) >= parseInt(newPrice.value)) {
            onBiddingFail("You must provide a higher than current price");
            return;
        }

        if (parseInt(newPrice.value) % parseInt(price) % parseInt(newPrice.step) !== 0) {
            onBiddingFail("Your new price is not valid for this product please check!");
            return;
        }

        return onBiddingConfirm(productId, parseInt(newPrice.value));
    }

    if (window.location.pathname.startsWith('/products')) {
        let priceStep = newPrice.step;
        newPrice = parseInt(price) + parseInt(priceStep);
        if (parseInt(price) >= parseInt(newPrice.value)) {
            alert('You must provide a higher than current price');
            return;
        }
    }

    return onBiddingConfirm(productId ,newPrice);
}

let onBiddingFail = (message) => {
    return alertify.alert(
        "<div>"+
        "<span style='color: #ca1515;font-family: 'Montserrat', sans-serif;'>"+
            message
        +"</span>"+
        "</div>",
    () => {
        alertify.message('OK');
    });
}

let onBiddingConfirm = (productId, price) => {
    alertify.confirm("Are you sure with price " + price +"?",
    () => {
        alertify.success('Successful!');
        biddingProduct(productId, price);
    },
    () => {
        alertify.error('Uh-oh! 😕');
    });
}

socket.on('res-on-not-authentication', (error) => {
    console.log('errrr');
    return onBiddingFail(error.message);
})

socket.on('on-bidding-fail', (error) => {
    return onBiddingFail(error.message);
})

/**
 * Send params to the server
 *
 * @param {String} productId
 * @param {String} price
 */
let biddingProduct = async (productId, newPrice) => {
    await socket.emit("req-product-bidding", {
        productId,
        newPrice
    });
}

socket.on("res-product-bidding-price", (data) => {
    let price = document.getElementById(data.productId);
    price.classList.remove('text-danger');
    price.classList.add('text-success');
    //details page
    let inputPrice = document.getElementById('input-price' + data.productId);
    if (inputPrice) {
        inputPrice.value = parseInt(data.price) + parseInt(data.priceStep);
        inputPrice.min = data.price;
    }
    document.getElementById('number-product-bidding').innerHTML = data.biddingCount;
    anime({
        targets: price,
        innerHTML: [0, data.price],
        easing: 'linear',
        round: 10
    });
})