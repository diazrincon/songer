$(function() {
  var audio = $("audio");
  let songList = [{name: "Hola"}];

  function loadSongs() {
    $.ajax({
      url: "/songs"
    })
      .done(function(songs) {
        var list = $(".list-group");
        list.empty();
        songs.forEach(function(song) {
          var li = $(
            '<li class="list-group-item d-flex justify-content-between align-items-center">' +
              song.name +
              "</li>"
          );
          var btn = $(
            '<button type="button" class="btn btn-primary"><i class="fas fa-play"></i></button>'
          );
          btn.on("click", song, play);
          btn.appendTo(li);
          li.appendTo(list);
        });
      })
      .fail(function() {
        alert("Can't load songs!");
      });
  }

  function play(event) {
    audio[0].pause();
    audio.attr("src", 'http://' + event.data.src + ':3001/songs/' + event.data.name);
    audio[0].play();
  }

  loadSongs();
});
