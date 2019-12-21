class GameController {
  private levelFactory: LevelFactory;
  private level: Level;
  private player: Player;
  private collisionDetection: CollisionDetection;
  private score: number;
  private highScore: number;
  private levelNumber: number;
  private isStartingNextLevel: boolean;
  private countDown: number;

  constructor() {
    this.score = 0;
    this.highScore = 0;
    this.levelNumber = 2;
    this.levelFactory = new LevelFactory();
    this.level = this.levelFactory.createLevel(this.levelNumber);
    this.player = new Player(width / 2, height - 100);
    this.collisionDetection = new CollisionDetection();
    this.isStartingNextLevel = false;
    this.countDown = 5;
  }

  public drawGame(): void {
    this.player.move();

    const heightBeforeGameStarts = height / 2;
    if (
      this.player.pos.y < heightBeforeGameStarts ||
      this.level.levelProgress > 0
    ) {
      this.level.updateLevel();
    }

    // moves all level objects down
    this.level.levelObjects.forEach((levelObject, index) => {
      if (
        this.collisionDetection.playerCollidedWithBlock(
          this.player,
          levelObject
        )
      ) {
        if (levelObject instanceof Item) {
          this.level.levelObjects.splice(index, 1);

          gameController.collectItem();
        } else if (levelObject instanceof SpeedBoost) {
          this.level.levelObjects.splice(index, 1);
          gameController.collectItem();
          this.player.speedBoost();
        } else {
          this.player.bounceOnBlock(levelObject.pos);
        }
      }
    });

    const r = map(this.level.levelProgress, 0, 100, 120, 60);
    const b = map(this.level.levelProgress, 0, 100, 170, 110);
    const g = map(this.level.levelProgress, 0, 100, 235, 200);

    // background("cornflowerblue");
    background(r, b, g);

    this.level.drawLevel();
    this.displayScoreBoard();
    this.player.drawPlayer();
    if (this.isStartingNextLevel) this.displayCountDown();

    console.log("progress", this.level.levelProgress);

    if (this.level.levelProgress >= 100 && !this.isStartingNextLevel) {
      console.log("new level");

      this.isStartingNextLevel = true;
      setTimeout(() => {
        this.levelNumber += 1;
        this.player.pos = new Position(width / 2, height - 100);
        this.level = this.levelFactory.createLevel(this.levelNumber);
        this.isStartingNextLevel = false;
        this.countDown = 5;
      }, 5000);

      const nextLevelTimer = setInterval(() => {
        if (this.countDown < 1) {
          this.countDown = 5;
          clearInterval(nextLevelTimer);
        }
        else this.countDown -= 1;
        console.log("countdown");
        
      }, 1000);
    }
  }

  private displayCountDown() {
    push();
    textAlign(CENTER);
    fill(0);
    textSize(32);
    text("Next level in " + this.countDown, width / 2, height / 4);
    pop();
  }

  private collectItem(): void {
    this.score += 1;
    if (this.score >= this.highScore) {
      this.highScore = this.score;
    }
  }

  private gameOver(): void {}

  private drawScoreBoard(): void {
    function scoreText(): void {
      push();
      fill(0, 10, 153);
      textSize(18);
      text("Level", 275, 35);
      text("High Score", 85, 55);
      text("Score", 430, 55);
      pop();
    }

    const scorePoints = (): void => {
      push();
      fill(255, 255, 255);
      textSize(18);
      text(this.highScore, 90, 75);
      text(this.score, 430, 75);
      textSize(62);
      textAlign(CENTER);
      text(this.levelNumber, 300, 90);
      pop();
    };

    function scoreBoard(): void {
      push();
      let c: p5.Color = color(252, 208, 107);
      stroke(c);
      fill(c);
      circle(300, 60, 100);
      strokeWeight(50);
      line(75, 60, 525, 60);
      pop();
    }

    scoreBoard();
    scoreText();
    scorePoints();
  }
}
