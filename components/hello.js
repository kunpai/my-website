export default function Hello(){
    return (
        <div className="position-relative" style={{ width: '200px', height: '200px' }}>
          {/* Circle */}
          <div
            className="position-absolute bg-primary rounded-circle"
            style={{ width: '100px', height: '100px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          ></div>
          <TextBox />
        </div>
      );
}

function TextBox(){
    return (
        <div className="custom-textbox">
          <div className="triangle"></div>
          <div className="content p-3">
            <p>Hello, this is a custom-shaped textbox!</p>
          </div>
        </div>
      );
}