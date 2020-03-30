setTimeout(() => {
  $(".alert").hide(2000, function() {
    $(this).remove();
  });
}, 3000);
