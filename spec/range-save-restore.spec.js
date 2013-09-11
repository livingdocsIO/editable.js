describe('RangeSaveRestore', function() {

  var range, host;
  beforeEach(function() {
    range = rangy.createRange();
  });

  it('saves a range', function(){
    // <div>|a|</div>
    host = $('<div>a</div>');
    range.setStart(host[0], 0);
    range.setEnd(host[0], 1);
    rangeSaveRestore.save(range);
    expect(range.toHtml()).toEqual('a')
    expect(host[0].childNodes[0].nodeName).toEqual('SPAN')
    expect(host[0].childNodes[1].nodeValue).toEqual('a')
    expect(host[0].childNodes[2].nodeName).toEqual('SPAN')
  });

  it('restores a range', function(){
    // <div>|a|</div>
    host = $('<div>a</div>');
    range.setStart(host[0], 0);
    range.setEnd(host[0], 1);
    var savedRange = rangeSaveRestore.save(range);
    var recoveredRange = rangeSaveRestore.restore(host[0], savedRange);
    expect(host.html()).toEqual('a');
    expect(recoveredRange.toHtml()).toEqual('a');
  });
});
